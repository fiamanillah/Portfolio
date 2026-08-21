// src/Modules/Skill/skill.service.ts
import { prisma, SkillStatus, Skill, SkillCategory, Prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import { NotFoundError, BadRequestError } from "@/core/errors/AppError";
import {
  SkillDTO,
  SkillListItemDTO,
  SkillStatsDTO,
  SkillCategoryDTO,
  SkillSectionPublicDTO,
  CreateSkillDTO,
  UpdateSkillDTO,
  ListSkillsQueryDTO,
  PublicSkillQueryDTO,
  BulkSkillStatusDTO,
  BulkSkillDeleteDTO,
  ReorderSkillsDTO,
  CreateSkillCategoryDTO,
  UpdateSkillCategoryDTO,
  ReorderSkillCategoriesDTO,
} from "./SkillDTO";

export class SkillService {
  private logger = new AppLogger("SkillService");

  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Helper to format raw database Skill record into full SkillDTO
   */
  private formatSkill(skill: Skill & { category?: SkillCategory | null }): SkillDTO {
    return {
      id: skill.id,
      name: skill.name,
      leftLabel: skill.leftLabel,
      rightLabel: skill.rightLabel,
      level: skill.level,
      icon: skill.icon,
      tags: skill.tags,
      featured: skill.featured,
      order: skill.order,
      status: skill.status as SkillStatus,
      categoryId: skill.categoryId,
      category: skill.category
        ? {
            id: skill.category.id,
            slug: skill.category.slug,
            code: skill.category.code,
            title: skill.category.title,
            badge: skill.category.badge,
            color: skill.category.color,
          }
        : null,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to format raw database Skill record into SkillListItemDTO
   */
  private formatSkillListItem(
    skill: Skill & { category?: SkillCategory | null }
  ): SkillListItemDTO {
    return {
      id: skill.id,
      name: skill.name,
      leftLabel: skill.leftLabel,
      rightLabel: skill.rightLabel,
      level: skill.level,
      icon: skill.icon,
      tags: skill.tags,
      featured: skill.featured,
      order: skill.order,
      status: skill.status as SkillStatus,
      categoryId: skill.categoryId,
      categoryName: skill.category?.title || null,
      categoryCode: skill.category?.code || null,
      categoryBadge: skill.category?.badge || null,
      categoryColor: skill.category?.color || null,
      createdAt: skill.createdAt.toISOString(),
      updatedAt: skill.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to format raw database SkillCategory record into SkillCategoryDTO
   */
  private formatCategory(
    category: SkillCategory & { _count?: { skills: number } }
  ): SkillCategoryDTO {
    return {
      id: category.id,
      slug: category.slug,
      code: category.code,
      title: category.title,
      badge: category.badge,
      ordinal: category.ordinal,
      suffix: category.suffix,
      icon: category.icon,
      color: category.color,
      description: category.description,
      order: category.order,
      status: category.status as SkillStatus,
      skillsCount: category._count?.skills,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }

  // =========================================================================
  // PUBLIC DISCOVERY QUERIES (SSR, Astro Homepage, Portfolio)
  // =========================================================================

  /**
   * Fetch all published skill categories and skills formatted for frontend rendering
   */
  public async getPublicSkills(
    query: PublicSkillQueryDTO = {}
  ): Promise<SkillSectionPublicDTO[]> {
    const categories = await this.db.skillCategory.findMany({
      where: {
        status: SkillStatus.PUBLISHED,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        skills: {
          where: {
            status: SkillStatus.PUBLISHED,
            ...(query.featured ? { featured: true } : {}),
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return categories.map((cat) => ({
      code: cat.code,
      ordinal: cat.ordinal || "01",
      suffix: cat.suffix || "ST",
      label: cat.title,
      badge: cat.badge,
      icon: cat.icon,
      color: cat.color,
      items: cat.skills.map((s) => ({
        title: s.name,
        left: s.leftLabel || "Stack",
        right: s.rightLabel || "Proficient",
        level: s.level,
        tags: s.tags,
        icon: s.icon,
      })),
    }));
  }

  // =========================================================================
  // ADMIN DASHBOARD QUERIES & STATS
  // =========================================================================

  /**
   * Aggregated KPI metrics for the skills dashboard
   */
  public async getStats(): Promise<SkillStatsDTO> {
    const [
      totalSkills,
      publishedCount,
      draftCount,
      archivedCount,
      totalCategories,
      featuredCount,
      categoriesWithCount,
      allSkills,
    ] = await Promise.all([
      this.db.skill.count(),
      this.db.skill.count({ where: { status: SkillStatus.PUBLISHED } }),
      this.db.skill.count({ where: { status: SkillStatus.DRAFT } }),
      this.db.skill.count({ where: { status: SkillStatus.ARCHIVED } }),
      this.db.skillCategory.count(),
      this.db.skill.count({ where: { featured: true } }),
      this.db.skillCategory.findMany({
        select: {
          id: true,
          code: true,
          title: true,
          _count: { select: { skills: true } },
        },
        orderBy: { order: "asc" },
      }),
      this.db.skill.findMany({
        select: {
          tags: true,
        },
      }),
    ]);

    // Tag frequency analysis
    const tagCountMap = new Map<string, number>();
    for (const item of allSkills) {
      for (const tag of item.tags || []) {
        const normalized = tag.trim();
        if (normalized) {
          tagCountMap.set(normalized, (tagCountMap.get(normalized) || 0) + 1);
        }
      }
    }

    const topTags = Array.from(tagCountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const categoryBreakdown = categoriesWithCount.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.title,
      count: c._count.skills,
    }));

    return {
      totalSkills,
      publishedCount,
      draftCount,
      archivedCount,
      totalCategories,
      featuredCount,
      categoryBreakdown,
      topTags,
    };
  }

  /**
   * Searchable & filterable paginated list of skills
   */
  public async getAllAdmin(query: ListSkillsQueryDTO): Promise<{
    data: SkillListItemDTO[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      status,
      featured,
      tag,
      sortBy = "order",
      sortOrder = "asc",
    } = query;

    const where: Prisma.SkillWhereInput = {};

    if (status) {
      where.status = status as SkillStatus;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { leftLabel: { contains: search, mode: "insensitive" } },
        { rightLabel: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ];
    }

    const skip = (page - 1) * limit;
    const orderBy: Prisma.SkillOrderByWithRelationInput = {};

    if (sortBy === "order") {
      orderBy.order = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else if (sortBy === "level") {
      orderBy.level = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === "updatedAt") {
      orderBy.updatedAt = sortOrder;
    }

    const [total, skills] = await Promise.all([
      this.db.skill.count({ where }),
      this.db.skill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [orderBy, { createdAt: "desc" }],
        include: {
          category: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: skills.map((s) => this.formatSkillListItem(s)),
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
   * Get single skill by ID
   */
  public async getById(id: string): Promise<SkillDTO> {
    const skill = await this.db.skill.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!skill) {
      throw new NotFoundError(`Skill with ID '${id}' not found`);
    }

    return this.formatSkill(skill);
  }

  /**
   * Create new skill
   */
  public async create(dto: CreateSkillDTO): Promise<SkillDTO> {
    // If order not explicitly specified, place at the end of category or list
    let order = dto.order;
    if (order === undefined || order === 0) {
      const lastSkill = await this.db.skill.findFirst({
        where: dto.categoryId ? { categoryId: dto.categoryId } : undefined,
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (lastSkill?.order ?? -1) + 1;
    }

    const skill = await this.db.skill.create({
      data: {
        name: dto.name,
        leftLabel: dto.leftLabel || null,
        rightLabel: dto.rightLabel || null,
        level: dto.level ?? 5,
        icon: dto.icon || null,
        tags: dto.tags || [],
        featured: dto.featured ?? false,
        order,
        status: (dto.status as SkillStatus) || SkillStatus.PUBLISHED,
        categoryId: dto.categoryId || null,
      },
      include: { category: true },
    });

    this.logger.info(`✔ Skill '${skill.name}' created (${skill.id})`);
    return this.formatSkill(skill);
  }

  /**
   * Update existing skill
   */
  public async update(id: string, dto: UpdateSkillDTO): Promise<SkillDTO> {
    const existing = await this.db.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Skill with ID '${id}' not found`);
    }

    const updated = await this.db.skill.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.leftLabel !== undefined ? { leftLabel: dto.leftLabel || null } : {}),
        ...(dto.rightLabel !== undefined ? { rightLabel: dto.rightLabel || null } : {}),
        ...(dto.level !== undefined ? { level: dto.level } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon || null } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.status !== undefined ? { status: dto.status as SkillStatus } : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId || null } : {}),
      },
      include: { category: true },
    });

    this.logger.info(`✔ Skill '${updated.name}' updated (${updated.id})`);
    return this.formatSkill(updated);
  }

  /**
   * Delete skill
   */
  public async delete(id: string): Promise<{ id: string }> {
    const existing = await this.db.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Skill with ID '${id}' not found`);
    }

    await this.db.skill.delete({ where: { id } });
    this.logger.info(`✔ Skill '${existing.name}' deleted (${id})`);
    return { id };
  }

  /**
   * Duplicate skill into draft
   */
  public async duplicate(id: string): Promise<SkillDTO> {
    const existing = await this.db.skill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Skill with ID '${id}' not found`);
    }

    const duplicated = await this.db.skill.create({
      data: {
        name: `${existing.name} (Copy)`,
        leftLabel: existing.leftLabel,
        rightLabel: existing.rightLabel,
        level: existing.level,
        icon: existing.icon,
        tags: [...existing.tags],
        featured: false,
        order: existing.order + 1,
        status: SkillStatus.DRAFT,
        categoryId: existing.categoryId,
      },
      include: { category: true },
    });

    this.logger.info(`✔ Skill '${existing.name}' duplicated as '${duplicated.name}'`);
    return this.formatSkill(duplicated);
  }

  /**
   * Bulk update status for multiple skills
   */
  public async bulkUpdateStatus(dto: BulkSkillStatusDTO): Promise<{ count: number }> {
    const result = await this.db.skill.updateMany({
      where: { id: { in: dto.ids } },
      data: { status: dto.status as SkillStatus },
    });

    this.logger.info(`✔ Bulk updated status to '${dto.status}' for ${result.count} skills`);
    return { count: result.count };
  }

  /**
   * Bulk delete skills
   */
  public async bulkDelete(dto: BulkSkillDeleteDTO): Promise<{ count: number }> {
    const result = await this.db.skill.deleteMany({
      where: { id: { in: dto.ids } },
    });

    this.logger.info(`✔ Bulk deleted ${result.count} skills`);
    return { count: result.count };
  }

  /**
   * Reorder skills
   */
  public async reorder(dto: ReorderSkillsDTO): Promise<{ updated: number }> {
    await this.db.$transaction(
      dto.items.map((item) =>
        this.db.skill.update({
          where: { id: item.id },
          data: {
            order: item.order,
            ...(item.categoryId !== undefined ? { categoryId: item.categoryId } : {}),
          },
        })
      )
    );

    this.logger.info(`✔ Reordered ${dto.items.length} skills`);
    return { updated: dto.items.length };
  }

  // =========================================================================
  // CATEGORY MANAGEMENT
  // =========================================================================

  /**
   * List all categories
   */
  public async listCategories(): Promise<SkillCategoryDTO[]> {
    const categories = await this.db.skillCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { skills: true },
        },
      },
    });

    return categories.map((c) => this.formatCategory(c));
  }

  /**
   * Get single category by ID
   */
  public async getCategoryById(id: string): Promise<SkillCategoryDTO> {
    const category = await this.db.skillCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { skills: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    return this.formatCategory(category);
  }

  /**
   * Create skill category
   */
  public async createCategory(dto: CreateSkillCategoryDTO): Promise<SkillCategoryDTO> {
    const existing = await this.db.skillCategory.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestError(`Category with slug '${dto.slug}' already exists`);
    }

    let order = dto.order;
    if (order === undefined || order === 0) {
      const lastCat = await this.db.skillCategory.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      order = (lastCat?.order ?? 0) + 1;
    }

    const category = await this.db.skillCategory.create({
      data: {
        slug: dto.slug,
        code: dto.code,
        title: dto.title,
        badge: dto.badge,
        ordinal: dto.ordinal || "01",
        suffix: dto.suffix || "ST",
        icon: dto.icon || null,
        color: dto.color || "blue",
        description: dto.description || null,
        order,
        status: (dto.status as SkillStatus) || SkillStatus.PUBLISHED,
      },
      include: {
        _count: { select: { skills: true } },
      },
    });

    this.logger.info(`✔ Category '${category.title}' created (${category.id})`);
    return this.formatCategory(category);
  }

  /**
   * Update skill category
   */
  public async updateCategory(
    id: string,
    dto: UpdateSkillCategoryDTO
  ): Promise<SkillCategoryDTO> {
    const existing = await this.db.skillCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const slugTaken = await this.db.skillCategory.findUnique({
        where: { slug: dto.slug },
      });
      if (slugTaken) {
        throw new BadRequestError(`Category with slug '${dto.slug}' already exists`);
      }
    }

    const updated = await this.db.skillCategory.update({
      where: { id },
      data: {
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.code !== undefined ? { code: dto.code } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.badge !== undefined ? { badge: dto.badge } : {}),
        ...(dto.ordinal !== undefined ? { ordinal: dto.ordinal } : {}),
        ...(dto.suffix !== undefined ? { suffix: dto.suffix } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon || null } : {}),
        ...(dto.color !== undefined ? { color: dto.color || "blue" } : {}),
        ...(dto.description !== undefined ? { description: dto.description || null } : {}),
        ...(dto.order !== undefined ? { order: dto.order } : {}),
        ...(dto.status !== undefined ? { status: dto.status as SkillStatus } : {}),
      },
      include: {
        _count: { select: { skills: true } },
      },
    });

    this.logger.info(`✔ Category '${updated.title}' updated (${updated.id})`);
    return this.formatCategory(updated);
  }

  /**
   * Delete skill category
   */
  public async deleteCategory(id: string): Promise<{ id: string }> {
    const existing = await this.db.skillCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Category with ID '${id}' not found`);
    }

    await this.db.skillCategory.delete({ where: { id } });
    this.logger.info(`✔ Category '${existing.title}' deleted (${id})`);
    return { id };
  }

  /**
   * Reorder categories
   */
  public async reorderCategories(
    dto: ReorderSkillCategoriesDTO
  ): Promise<{ updated: number }> {
    await this.db.$transaction(
      dto.items.map((item) =>
        this.db.skillCategory.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    this.logger.info(`✔ Reordered ${dto.items.length} categories`);
    return { updated: dto.items.length };
  }

  // =========================================================================
  // SEED DEFAULT SKILLS & CATEGORIES
  // =========================================================================

  /**
   * Re-seeds default skill categories and skills
   */
  public async seedDefault(): Promise<{
    createdCategories: number;
    createdSkills: number;
    message: string;
  }> {
    const defaultCategories = [
      {
        slug: "frontend",
        code: "Frontend",
        ordinal: "01",
        suffix: "ST",
        title: "Frontend & Languages",
        badge: "Frontend & Languages",
        icon: "◈",
        color: "cyan",
        order: 1,
        skills: [
          { name: "HTML / CSS / JS", leftLabel: "Core Web", rightLabel: "DOM Styling", level: 5, tags: ["Core Web", "DOM", "CSS3", "ESNext"], order: 1 },
          { name: "Typescript / Go", leftLabel: "Languages", rightLabel: "Go Basic", level: 4, tags: ["TypeScript", "Golang", "Type System"], order: 2 },
          { name: "React / Next.js", leftLabel: "Core Stack", rightLabel: "SSR Ready", level: 5, tags: ["React 19", "Next.js", "App Router", "SSR"], order: 3 },
          { name: "Tailwind / Shadcn UI", leftLabel: "Atomic CSS", rightLabel: "Systemic Design", level: 5, tags: ["TailwindCSS", "Shadcn", "Design Systems"], order: 4 },
          { name: "Redux / WebSockets", leftLabel: "State Mgmt", rightLabel: "Realtime", level: 4, tags: ["Redux Toolkit", "WebSockets", "Socket.io", "RTK Query"], order: 5 },
        ],
      },
      {
        slug: "backend",
        code: "Backend",
        ordinal: "02",
        suffix: "ND",
        title: "Backend & Data Layer",
        badge: "Backend & Data Layer",
        icon: "◉",
        color: "indigo",
        order: 2,
        skills: [
          { name: "Node / Express", leftLabel: "Runtime", rightLabel: "API Design", level: 5, tags: ["Node.js", "Express", "REST APIs"], order: 1 },
          { name: "Nest.js", leftLabel: "Architecture", rightLabel: "Scalable API", level: 4, tags: ["NestJS", "TypeScript", "Microservices"], order: 2 },
          { name: "PostgreSQL / MySQL", leftLabel: "Relational", rightLabel: "Data Integrity", level: 5, tags: ["PostgreSQL", "MySQL", "ACID", "Indexing"], order: 3 },
          { name: "MongoDB / Redis", leftLabel: "NoSQL", rightLabel: "Caching Layer", level: 4, tags: ["MongoDB", "Redis", "PubSub", "In-Memory"], order: 4 },
          { name: "Prisma / Mongoose", leftLabel: "ORMs", rightLabel: "Modeling", level: 5, tags: ["Prisma", "Mongoose", "Migrations"], order: 5 },
        ],
      },
      {
        slug: "infra",
        code: "Infra",
        ordinal: "03",
        suffix: "RD",
        title: "Operational Flow",
        badge: "Operational Flow",
        icon: "✦",
        color: "gold",
        order: 3,
        skills: [
          { name: "Docker / Nginx", leftLabel: "Containers", rightLabel: "Reverse Proxy", level: 4, tags: ["Docker", "Docker Compose", "Nginx", "Reverse Proxy"], order: 1 },
          { name: "Linux / VPS", leftLabel: "SysAdmin", rightLabel: "Self-Managed", level: 4, tags: ["Linux", "Ubuntu", "Bash", "Systemd", "VPS"], order: 2 },
          { name: "AWS / GCP / Git", leftLabel: "Cloud Infrastructure", rightLabel: "CI/CD", level: 4, tags: ["AWS S3", "GCP", "Git", "GitHub Actions", "CI/CD"], order: 3 },
          { name: "Proxmox / KVM", leftLabel: "Hypervisor", rightLabel: "Virtualization", level: 3, tags: ["Proxmox", "KVM", "Virtualization"], order: 4 },
          { name: "RabbitMQ / BullMQ", leftLabel: "Message Brokers", rightLabel: "Event Driven", level: 4, tags: ["RabbitMQ", "BullMQ", "Event-Driven", "Task Queues"], order: 5 },
        ],
      },
    ];

    let createdCategories = 0;
    let createdSkills = 0;

    for (const cat of defaultCategories) {
      const { skills, ...catData } = cat;
      const categoryRecord = await this.db.skillCategory.upsert({
        where: { slug: catData.slug },
        update: {
          ...catData,
          status: SkillStatus.PUBLISHED,
        },
        create: {
          ...catData,
          status: SkillStatus.PUBLISHED,
        },
      });
      createdCategories++;

      for (const skill of skills) {
        const existingSkill = await this.db.skill.findFirst({
          where: { name: skill.name, categoryId: categoryRecord.id },
        });

        if (!existingSkill) {
          await this.db.skill.create({
            data: {
              ...skill,
              categoryId: categoryRecord.id,
              status: SkillStatus.PUBLISHED,
            },
          });
          createdSkills++;
        } else {
          await this.db.skill.update({
            where: { id: existingSkill.id },
            data: {
              ...skill,
              status: SkillStatus.PUBLISHED,
            },
          });
          createdSkills++;
        }
      }
    }

    return {
      createdCategories,
      createdSkills,
      message: `Successfully seeded ${createdCategories} categories and ${createdSkills} skills`,
    };
  }
}
