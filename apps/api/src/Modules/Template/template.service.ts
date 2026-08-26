// src/Modules/Template/template.service.ts
import { prisma, Prisma } from "@workspace/db"
import { AppLogger } from "@workspace/logger"
import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import { SYSTEM_TEMPLATES } from "@/templates/emails/defaultTemplates"
import { PlunkTemplateService, PlunkListTemplatesQuery } from "@/services/PlunkTemplateService"
import { TemplateRenderer, RenderResult } from "@/services/TemplateRenderer"
import type { EmailTemplateType } from "@workspace/shared"
import {
  CreateTemplateDTO,
  UpdateTemplateDTO,
  PreviewTemplateDTO,
  SendTestEmailDTO,
  ListTemplatesQueryDTO,
} from "./TemplateDTO"

export class TemplateService {
  private logger = new AppLogger("TemplateService")

  /**
   * Initializes built-in system templates into the database on bootstrap without
   * overwriting custom edits that an admin might have made.
   */
  public async initializeSystemTemplates(): Promise<void> {
    try {
      this.logger.info("Initializing and checking system email templates...")

      for (const sysTemplate of SYSTEM_TEMPLATES) {
        const existing = await prisma.emailTemplate.findUnique({
          where: { slug: sysTemplate.slug },
        })

        if (!existing) {
          await prisma.emailTemplate.create({
            data: {
              slug: sysTemplate.slug,
              name: sysTemplate.name,
              description: sysTemplate.description,
              subject: sysTemplate.subject,
              body: sysTemplate.body,
              from: sysTemplate.from,
              fromName: sysTemplate.fromName,
              replyTo: sysTemplate.replyTo,
              type: sysTemplate.type,
              isSystem: true,
            },
          })
          this.logger.info(
            `Seeded default system template: [${sysTemplate.slug}] "${sysTemplate.name}"`
          )
        } else if (existing.isSystem) {
          // Keep system template definition up-to-date with codebase defaults
          await prisma.emailTemplate.update({
            where: { slug: sysTemplate.slug },
            data: {
              name: sysTemplate.name,
              description: sysTemplate.description,
              subject: sysTemplate.subject,
              body: sysTemplate.body,
              from: sysTemplate.from,
              fromName: sysTemplate.fromName,
              replyTo: sysTemplate.replyTo,
              type: sysTemplate.type,
              isSystem: true,
            },
          })
        }
      }
      this.logger.info("System email templates verified and ready.")
    } catch (error) {
      this.logger.error("Failed to initialize system email templates", {
        error,
      })
    }
  }

  /**
   * KPI STATS: Aggregates total, codebase, custom, and plunk sync statistics
   */
  public async getStats() {
    const [total, systemCount, customCount, plunkSyncedCount, typeGroups] =
      await Promise.all([
        prisma.emailTemplate.count(),
        prisma.emailTemplate.count({ where: { isSystem: true } }),
        prisma.emailTemplate.count({ where: { isSystem: false } }),
        prisma.emailTemplate.count({ where: { plunkId: { not: null } } }),
        prisma.emailTemplate.groupBy({
          by: ["type"],
          _count: { _all: true },
        }),
      ])

    const typesCount: Record<string, number> = {
      TRANSACTIONAL: 0,
      MARKETING: 0,
      HEADLESS: 0,
    }

    for (const group of typeGroups) {
      typesCount[group.type] = group._count._all
    }

    return {
      total,
      systemCount,
      customCount,
      plunkSyncedCount,
      typesCount,
    }
  }

  /**
   * CREATE: Creates a new email template in database and syncs with Plunk.
   */
  public async createTemplate(dto: CreateTemplateDTO) {
    const slug = (
      dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    ).replace(/(^-|-$)/g, "")

    const existing = await prisma.emailTemplate.findUnique({ where: { slug } })
    if (existing) {
      throw new BadRequestError(
        `A template with slug "${slug}" already exists.`
      )
    }

    let plunkId: string | null = null
    let syncedAt: Date | null = null

    if (dto.syncToPlunk !== false) {
      try {
        const plunkRes = await PlunkTemplateService.createTemplate({
          name: dto.name,
          description: dto.description,
          subject: dto.subject,
          body: dto.body,
          from: dto.from,
          fromName: dto.fromName,
          replyTo: dto.replyTo,
          type: dto.type,
        })
        plunkId = plunkRes.id
        syncedAt = new Date()
      } catch (err) {
        this.logger.warn(
          `Failed to sync template "${dto.name}" with Plunk on creation`,
          { err }
        )
      }
    }

    const template = await prisma.emailTemplate.create({
      data: {
        slug,
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
        body: dto.body,
        from: dto.from,
        fromName: dto.fromName,
        replyTo: dto.replyTo,
        type: dto.type,
        plunkId,
        isSystem: false,
        syncedAt,
      },
    })

    this.logger.info(
      `✔ Created email template "${template.name}" (${template.slug}) [Plunk ID: ${plunkId || "local-only"}]`
    )
    return template
  }

  /**
   * READ ALL: Paginated and filterable list of templates.
   */
  public async getAllTemplates(query: ListTemplatesQueryDTO) {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      source,
      syncStatus,
      isSystem,
      sortBy = "updatedAt",
      sortOrder = "desc",
    } = query
    const skip = (page - 1) * limit

    const where: Prisma.EmailTemplateWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (type && type !== "ALL") {
      where.type = type as EmailTemplateType
    }

    if (source === "CODEBASE") {
      where.isSystem = true
    } else if (source === "CUSTOM") {
      where.isSystem = false
    } else if (isSystem !== undefined) {
      where.isSystem = isSystem
    }

    if (syncStatus === "SYNCED") {
      where.plunkId = { not: null }
    } else if (syncStatus === "LOCAL") {
      where.plunkId = null
    }

    // Build sort order
    const orderBy: Prisma.EmailTemplateOrderByWithRelationInput[] = []
    if (
      sortBy === "name" ||
      sortBy === "slug" ||
      sortBy === "type" ||
      sortBy === "createdAt" ||
      sortBy === "updatedAt" ||
      sortBy === "syncedAt"
    ) {
      orderBy.push({ [sortBy]: sortOrder })
    } else {
      orderBy.push({ isSystem: "desc" }, { updatedAt: "desc" })
    }

    const [total, templates] = await Promise.all([
      prisma.emailTemplate.count({ where }),
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ])

    // Attach sample data definitions if available
    const data = templates.map((tpl) => {
      const sysDef = SYSTEM_TEMPLATES.find((s) => s.slug === tpl.slug)
      return {
        ...tpl,
        sampleData: sysDef?.sampleData || {
          name: "Recipient",
          email: "recipient@example.com",
          subject: "Sample Subject",
          message: "Sample message content for template preview.",
        },
      }
    })

    const totalPages = Math.ceil(total / limit)

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    }
  }

  /**
   * READ ONE: Retrieves single template by ID or Slug.
   */
  public async getTemplateByIdOrSlug(idOrSlug: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug
      )

    const template = await prisma.emailTemplate.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    })

    if (!template) {
      throw new NotFoundError(`Email template "${idOrSlug}" not found`)
    }

    // Attach sample data if available
    const systemDef = SYSTEM_TEMPLATES.find((t) => t.slug === template.slug)
    const sampleData = systemDef?.sampleData || {
      name: "Recipient",
      email: "recipient@example.com",
      subject: "Sample Subject",
      message: "Sample message content for template preview.",
    }

    return {
      ...template,
      sampleData,
    }
  }

  /**
   * UPDATE: Updates a template in database and synchronizes changes to Plunk.
   */
  public async updateTemplate(id: string, dto: UpdateTemplateDTO) {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError(`Template with ID ${id} not found.`)
    }

    let plunkId = existing.plunkId
    let syncedAt = existing.syncedAt

    if (dto.syncToPlunk !== false) {
      try {
        if (plunkId) {
          await PlunkTemplateService.updateTemplate(plunkId, {
            name: dto.name || existing.name,
            description:
              dto.description !== undefined
                ? (dto.description ?? undefined)
                : (existing.description ?? undefined),
            subject: dto.subject || existing.subject,
            body: dto.body || existing.body,
            from:
              dto.from !== undefined
                ? (dto.from ?? undefined)
                : (existing.from ?? undefined),
            fromName:
              dto.fromName !== undefined
                ? (dto.fromName ?? undefined)
                : (existing.fromName ?? undefined),
            replyTo:
              dto.replyTo !== undefined
                ? (dto.replyTo ?? undefined)
                : (existing.replyTo ?? undefined),
            type: (dto.type || existing.type) as EmailTemplateType,
          })
          syncedAt = new Date()
        } else {
          // If not yet synced, create it in Plunk
          const plunkRes = await PlunkTemplateService.createTemplate({
            name: dto.name || existing.name,
            description:
              dto.description !== undefined
                ? (dto.description ?? undefined)
                : (existing.description ?? undefined),
            subject: dto.subject || existing.subject,
            body: dto.body || existing.body,
            from:
              dto.from !== undefined
                ? (dto.from ?? undefined)
                : (existing.from ?? undefined),
            fromName:
              dto.fromName !== undefined
                ? (dto.fromName ?? undefined)
                : (existing.fromName ?? undefined),
            replyTo:
              dto.replyTo !== undefined
                ? (dto.replyTo ?? undefined)
                : (existing.replyTo ?? undefined),
            type: (dto.type || existing.type) as EmailTemplateType,
          })
          plunkId = plunkRes.id
          syncedAt = new Date()
        }
      } catch (err) {
        this.logger.warn(`Failed to sync updated template ${id} to Plunk`, {
          err,
        })
      }
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.subject !== undefined ? { subject: dto.subject } : {}),
        ...(dto.body !== undefined ? { body: dto.body } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.from !== undefined ? { from: dto.from } : {}),
        ...(dto.fromName !== undefined ? { fromName: dto.fromName } : {}),
        ...(dto.replyTo !== undefined ? { replyTo: dto.replyTo } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.sampleData !== undefined
          ? { sampleData: dto.sampleData as Prisma.InputJsonValue }
          : {}),
        ...(plunkId !== undefined ? { plunkId } : {}),
        ...(syncedAt !== undefined ? { syncedAt } : {}),
      },
    })

    this.logger.info(`✔ Updated email template "${updated.name}" (${id})`)
    return updated
  }

  /**
   * RESET: Restores a codebase system template back to its default source code layout
   */
  public async resetSystemTemplate(idOrSlug: string) {
    const template = await this.getTemplateByIdOrSlug(idOrSlug)
    const sysDef = SYSTEM_TEMPLATES.find((t) => t.slug === template.slug)

    if (!sysDef) {
      throw new BadRequestError(
        `No codebase default template definition found for slug "${template.slug}"`
      )
    }

    const updated = await this.updateTemplate(template.id, {
      name: sysDef.name,
      description: sysDef.description,
      subject: sysDef.subject,
      body: sysDef.body,
      fromName: sysDef.fromName,
      replyTo: sysDef.replyTo,
      type: sysDef.type,
      syncToPlunk: true,
    })

    this.logger.info(
      `✔ Reset codebase template "${template.slug}" to default system layout`
    )
    return updated
  }

  /**
   * SYNC SINGLE: Pushes a single template to Plunk manually.
   */
  public async syncTemplateToPlunk(id: string) {
    const template = await this.getTemplateByIdOrSlug(id)
    let plunkId = template.plunkId

    if (plunkId) {
      await PlunkTemplateService.updateTemplate(plunkId, {
        name: template.name,
        description: template.description ?? undefined,
        subject: template.subject,
        body: template.body,
        from: template.from ?? undefined,
        fromName: template.fromName ?? undefined,
        replyTo: template.replyTo ?? undefined,
        type: template.type as EmailTemplateType,
      })
    } else {
      const plunkRes = await PlunkTemplateService.createTemplate({
        name: template.name,
        description: template.description ?? undefined,
        subject: template.subject,
        body: template.body,
        from: template.from ?? undefined,
        fromName: template.fromName ?? undefined,
        replyTo: template.replyTo ?? undefined,
        type: template.type as EmailTemplateType,
      })
      plunkId = plunkRes.id
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        plunkId,
        syncedAt: new Date(),
      },
    })

    this.logger.info(
      `✔ Single template sync completed: "${template.name}" -> Plunk ID ${plunkId}`
    )
    return updated
  }

  /**
   * DELETE: Deletes template from database and Plunk.
   */
  public async deleteTemplate(id: string, force: boolean = false) {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundError(`Template with ID ${id} not found.`)
    }

    if (existing.isSystem && !force) {
      throw new BadRequestError(
        "Codebase system email templates cannot be deleted. You can edit their subject/body or reset to default instead."
      )
    }

    if (existing.plunkId) {
      try {
        await PlunkTemplateService.deleteTemplate(existing.plunkId)
      } catch (err) {
        this.logger.warn(
          `Failed to delete template ${existing.plunkId} from Plunk`,
          { err }
        )
      }
    }

    await prisma.emailTemplate.delete({ where: { id } })
    this.logger.info(
      `✔ Deleted email template "${existing.name}" (${existing.id})`
    )
    return {
      success: true,
      message: `Template "${existing.name}" deleted successfully.`,
    }
  }

  /**
   * DUPLICATE: Duplicates template.
   */
  public async duplicateTemplate(id: string) {
    const original = await prisma.emailTemplate.findUnique({ where: { id } })
    if (!original) {
      throw new NotFoundError(`Template with ID ${id} not found.`)
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`
    const newName = `Copy of ${original.name}`

    return await this.createTemplate({
      slug: newSlug,
      name: newName,
      description: original.description
        ? `Duplicate of ${original.description}`
        : undefined,
      subject: original.subject,
      body: original.body,
      from: original.from || undefined,
      fromName: original.fromName || undefined,
      replyTo: original.replyTo || undefined,
      type: original.type as EmailTemplateType,
      syncToPlunk: true,
    })
  }

  /**
   * SYNC ALL: Push sync all local templates to Plunk API
   */
  public async syncAllToPlunk() {
    this.logger.info(
      "🔄 Initiating full template synchronization with Plunk API..."
    )
    const templates = await prisma.emailTemplate.findMany()

    const results = {
      total: templates.length,
      synced: 0,
      failed: 0,
      details: [] as {
        id: string
        name: string
        plunkId?: string
        status: string
        error?: string
      }[],
    }

    for (const template of templates) {
      try {
        if (template.plunkId) {
          // Update existing
          await PlunkTemplateService.updateTemplate(template.plunkId, {
            name: template.name,
            description: template.description ?? undefined,
            subject: template.subject,
            body: template.body,
            from: template.from ?? undefined,
            fromName: template.fromName ?? undefined,
            replyTo: template.replyTo ?? undefined,
            type: template.type as EmailTemplateType,
          })

          await prisma.emailTemplate.update({
            where: { id: template.id },
            data: { syncedAt: new Date() },
          })

          results.synced++
          results.details.push({
            id: template.id,
            name: template.name,
            plunkId: template.plunkId,
            status: "updated",
          })
        } else {
          // Create in Plunk
          const plunkRes = await PlunkTemplateService.createTemplate({
            name: template.name,
            description: template.description ?? undefined,
            subject: template.subject,
            body: template.body,
            from: template.from ?? undefined,
            fromName: template.fromName ?? undefined,
            replyTo: template.replyTo ?? undefined,
            type: template.type as EmailTemplateType,
          })

          await prisma.emailTemplate.update({
            where: { id: template.id },
            data: { plunkId: plunkRes.id, syncedAt: new Date() },
          })

          results.synced++
          results.details.push({
            id: template.id,
            name: template.name,
            plunkId: plunkRes.id,
            status: "created",
          })
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err)
        results.failed++
        results.details.push({
          id: template.id,
          name: template.name,
          status: "error",
          error: errMsg,
        })
        this.logger.error(`Sync failed for template "${template.name}"`, {
          error: err,
        })
      }
    }

    this.logger.info(
      `✔ Plunk sync completed: ${results.synced}/${results.total} synced (${results.failed} failed)`
    )
    return results
  }

  /**
   * REMOTE LIST: Fetches list of templates directly from Plunk API.
   */
  public async getRemotePlunkTemplates(query: PlunkListTemplatesQuery) {
    return await PlunkTemplateService.listTemplates(query)
  }

  /**
   * PREVIEW: Renders template preview with Liquid data interpolation.
   */
  public async renderPreview(dto: PreviewTemplateDTO): Promise<RenderResult> {
    let subject = dto.subject || ""
    let body = dto.body || ""
    let sampleData = dto.sampleData || {}

    if (dto.templateId || dto.slug) {
      const template = await this.getTemplateByIdOrSlug(
        (dto.templateId || dto.slug)!
      )
      if (!subject) subject = template.subject
      if (!body) body = template.body
      if (Object.keys(sampleData).length === 0 && template.sampleData) {
        sampleData = template.sampleData
      }
    }

    return await TemplateRenderer.renderTemplate(subject, body, sampleData)
  }

  /**
   * SEND TEST: Dispatches a live test email rendered with sample or custom context.
   */
  public async sendTestEmail(dto: SendTestEmailDTO) {
    let subject = dto.subject || ""
    let body = dto.body || ""
    let plunkId: string | undefined = undefined

    if (dto.templateId || dto.slug) {
      const template = await this.getTemplateByIdOrSlug(
        (dto.templateId || dto.slug)!
      )
      if (!subject) subject = template.subject
      if (!body) body = template.body
      plunkId = template.plunkId || undefined
    }

    // Render with test data
    const rendered = await TemplateRenderer.renderTemplate(
      subject,
      body,
      dto.data
    )

    await PlunkTemplateService.sendWithTemplate({
      to: dto.to,
      subject: `[TEST] ${rendered.subject}`,
      body: rendered.body,
      data: dto.data,
      templateId: plunkId,
    })

    return {
      success: true,
      to: dto.to,
      subject: rendered.subject,
      message: `Test email dispatched to ${dto.to}`,
    }
  }
}
