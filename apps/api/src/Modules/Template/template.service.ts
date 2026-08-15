// src/Modules/Template/template.service.ts
import { prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import { BadRequestError, NotFoundError } from "@/core/errors/AppError";
import { SYSTEM_TEMPLATES } from "@/templates/emails/defaultTemplates";
import { PlunkTemplateService } from "@/services/PlunkTemplateService";
import { TemplateRenderer, RenderResult } from "@/services/TemplateRenderer";
import {
  CreateTemplateDTO,
  UpdateTemplateDTO,
  PreviewTemplateDTO,
  SendTestEmailDTO,
  ListTemplatesQueryDTO,
} from "./TemplateDTO";

export class TemplateService {
  private logger = new AppLogger("TemplateService");

  /**
   * Initializes built-in system templates into the database on bootstrap.
   */
  public async initializeSystemTemplates(): Promise<void> {
    try {
      this.logger.info("⚙ Initializing and checking system email templates...");

      for (const sysTemplate of SYSTEM_TEMPLATES) {
        const existing = await prisma.emailTemplate.findUnique({
          where: { slug: sysTemplate.slug },
        });

        if (!existing) {
          await prisma.emailTemplate.create({
            data: {
              slug: sysTemplate.slug,
              name: sysTemplate.name,
              description: sysTemplate.description,
              subject: sysTemplate.subject,
              body: sysTemplate.body,
              fromName: sysTemplate.fromName,
              replyTo: sysTemplate.replyTo,
              type: sysTemplate.type,
              isSystem: true,
            },
          });
          this.logger.info(`✔ Seeded default system template: [${sysTemplate.slug}] "${sysTemplate.name}"`);
        } else if (existing.isSystem) {
          // Keep system template bodies aligned with latest layout updates
          await prisma.emailTemplate.update({
            where: { slug: sysTemplate.slug },
            data: {
              name: sysTemplate.name,
              description: sysTemplate.description,
              subject: sysTemplate.subject,
              body: sysTemplate.body,
              fromName: sysTemplate.fromName,
              replyTo: sysTemplate.replyTo,
              type: sysTemplate.type,
            },
          });
        }
      }
      this.logger.info("✔ System email templates verified and ready.");
    } catch (error) {
      this.logger.error("Failed to initialize system email templates", { error });
    }
  }

  /**
   * CREATE: Creates a new email template in database and syncs with Plunk.
   */
  public async createTemplate(dto: CreateTemplateDTO) {
    const slug = (dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/(^-|-$)/g, "");

    const existing = await prisma.emailTemplate.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestError(`A template with slug "${slug}" already exists.`);
    }

    let plunkId: string | null = null;
    let syncedAt: Date | null = null;

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
        });
        plunkId = plunkRes.id;
        syncedAt = new Date();
      } catch (err) {
        this.logger.warn(`Failed to sync template "${dto.name}" with Plunk on creation`, { err });
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
    });

    this.logger.info(`✔ Created email template "${template.name}" (${template.slug}) [Plunk ID: ${plunkId || 'local-only'}]`);
    return template;
  }

  /**
   * READ ALL: Paginated and filterable list of templates.
   */
  public async getAllTemplates(query: ListTemplatesQueryDTO) {
    const { page, limit, search, type, isSystem } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isSystem !== undefined) {
      where.isSystem = isSystem;
    }

    const [total, data] = await Promise.all([
      prisma.emailTemplate.count({ where }),
      prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isSystem: "desc" }, { updatedAt: "desc" }],
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

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
    };
  }

  /**
   * READ ONE: Retrieves single template by ID or Slug.
   */
  public async getTemplateByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);

    const template = await prisma.emailTemplate.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    });

    if (!template) {
      throw new NotFoundError(`Email template "${idOrSlug}" not found`);
    }

    // Attach sample data if available
    const systemDef = SYSTEM_TEMPLATES.find((t) => t.slug === template.slug);
    const sampleData = systemDef?.sampleData || {
      name: "Recipient",
      email: "recipient@example.com",
      subject: "Sample Subject",
      message: "Sample message content for template preview.",
    };

    return {
      ...template,
      sampleData,
    };
  }

  /**
   * UPDATE: Updates a template in database and synchronizes changes to Plunk.
   */
  public async updateTemplate(id: string, dto: UpdateTemplateDTO) {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Template with ID ${id} not found.`);
    }

    let plunkId = existing.plunkId;
    let syncedAt = existing.syncedAt;

    if (dto.syncToPlunk !== false) {
      try {
        if (plunkId) {
          await PlunkTemplateService.updateTemplate(plunkId, {
            name: dto.name,
            description: dto.description ?? undefined,
            subject: dto.subject,
            body: dto.body,
            from: dto.from ?? undefined,
            fromName: dto.fromName ?? undefined,
            replyTo: dto.replyTo ?? undefined,
            type: dto.type as any,
          });
          syncedAt = new Date();
        } else {
          // If not yet synced, create it in Plunk
          const plunkRes = await PlunkTemplateService.createTemplate({
            name: dto.name || existing.name,
            description: dto.description ?? existing.description ?? undefined,
            subject: dto.subject || existing.subject,
            body: dto.body || existing.body,
            from: dto.from ?? existing.from ?? undefined,
            fromName: dto.fromName ?? existing.fromName ?? undefined,
            replyTo: dto.replyTo ?? existing.replyTo ?? undefined,
            type: (dto.type || existing.type) as any,
          });
          plunkId = plunkRes.id;
          syncedAt = new Date();
        }
      } catch (err) {
        this.logger.warn(`Failed to sync updated template ${id} to Plunk`, { err });
      }
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
        body: dto.body,
        from: dto.from,
        fromName: dto.fromName,
        replyTo: dto.replyTo,
        type: dto.type,
        plunkId,
        syncedAt,
      },
    });

    this.logger.info(`✔ Updated email template "${updated.name}" (${updated.id})`);
    return updated;
  }

  /**
   * DELETE: Deletes template from database and Plunk.
   */
  public async deleteTemplate(id: string, force: boolean = false) {
    const existing = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Template with ID ${id} not found.`);
    }

    if (existing.isSystem && !force) {
      throw new BadRequestError("System email templates cannot be deleted.");
    }

    if (existing.plunkId) {
      try {
        await PlunkTemplateService.deleteTemplate(existing.plunkId);
      } catch (err) {
        this.logger.warn(`Failed to delete template ${existing.plunkId} from Plunk`, { err });
      }
    }

    await prisma.emailTemplate.delete({ where: { id } });
    this.logger.info(`✔ Deleted email template "${existing.name}" (${existing.id})`);
    return { success: true, message: `Template "${existing.name}" deleted successfully.` };
  }

  /**
   * DUPLICATE: Duplicates template.
   */
  public async duplicateTemplate(id: string) {
    const original = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!original) {
      throw new NotFoundError(`Template with ID ${id} not found.`);
    }

    const newSlug = `${original.slug}-copy-${Date.now()}`;
    const newName = `Copy of ${original.name}`;

    return await this.createTemplate({
      slug: newSlug,
      name: newName,
      description: original.description ? `Duplicate of ${original.description}` : undefined,
      subject: original.subject,
      body: original.body,
      from: original.from || undefined,
      fromName: original.fromName || undefined,
      replyTo: original.replyTo || undefined,
      type: original.type as any,
      syncToPlunk: true,
    });
  }

  /**
   * SYNC ALL: Push sync all local templates to Plunk API
   */
  public async syncAllToPlunk() {
    this.logger.info("🔄 Initiating full template synchronization with Plunk API...");
    const templates = await prisma.emailTemplate.findMany();

    const results = {
      total: templates.length,
      synced: 0,
      failed: 0,
      details: [] as { id: string; name: string; plunkId?: string; status: string; error?: string }[],
    };

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
            type: template.type as any,
          });

          await prisma.emailTemplate.update({
            where: { id: template.id },
            data: { syncedAt: new Date() },
          });

          results.synced++;
          results.details.push({
            id: template.id,
            name: template.name,
            plunkId: template.plunkId,
            status: "updated",
          });
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
            type: template.type as any,
          });

          await prisma.emailTemplate.update({
            where: { id: template.id },
            data: { plunkId: plunkRes.id, syncedAt: new Date() },
          });

          results.synced++;
          results.details.push({
            id: template.id,
            name: template.name,
            plunkId: plunkRes.id,
            status: "created",
          });
        }
      } catch (err: any) {
        results.failed++;
        results.details.push({
          id: template.id,
          name: template.name,
          status: "error",
          error: err?.message || String(err),
        });
        this.logger.error(`Sync failed for template "${template.name}"`, { error: err });
      }
    }

    this.logger.info(`✔ Plunk sync completed: ${results.synced}/${results.total} synced (${results.failed} failed)`);
    return results;
  }

  /**
   * REMOTE LIST: Fetches list of templates directly from Plunk API.
   */
  public async getRemotePlunkTemplates(query: any) {
    return await PlunkTemplateService.listTemplates(query);
  }

  /**
   * PREVIEW: Renders template preview with Liquid data interpolation.
   */
  public async renderPreview(dto: PreviewTemplateDTO): Promise<RenderResult> {
    let subject = dto.subject || "";
    let body = dto.body || "";
    let sampleData = dto.sampleData || {};

    if (dto.templateId || dto.slug) {
      const template = await this.getTemplateByIdOrSlug((dto.templateId || dto.slug)!);
      if (!subject) subject = template.subject;
      if (!body) body = template.body;
      if (Object.keys(sampleData).length === 0 && template.sampleData) {
        sampleData = template.sampleData;
      }
    }

    return await TemplateRenderer.renderTemplate(subject, body, sampleData);
  }

  /**
   * SEND TEST: Dispatches a live test email rendered with sample or custom context.
   */
  public async sendTestEmail(dto: SendTestEmailDTO) {
    let subject = dto.subject || "";
    let body = dto.body || "";
    let templateId = dto.templateId;
    let plunkId: string | undefined = undefined;

    if (dto.templateId || dto.slug) {
      const template = await this.getTemplateByIdOrSlug((dto.templateId || dto.slug)!);
      if (!subject) subject = template.subject;
      if (!body) body = template.body;
      plunkId = template.plunkId || undefined;
    }

    // Render with test data
    const rendered = await TemplateRenderer.renderTemplate(subject, body, dto.data);

    await PlunkTemplateService.sendWithTemplate({
      to: dto.to,
      subject: `[TEST] ${rendered.subject}`,
      body: rendered.body,
      data: dto.data,
      templateId: plunkId,
    });

    return {
      success: true,
      to: dto.to,
      subject: rendered.subject,
      message: `Test email dispatched to ${dto.to}`,
    };
  }
}
