// src/Modules/Experience/experience.service.ts
import { prisma, ExperienceStatus, Experience, Prisma } from "@workspace/db";
import { AppLogger } from "@workspace/logger";
import {
  NotFoundError,
  BadRequestError,
} from "@/core/errors/AppError";
import {
  ExperienceDTO,
  ExperienceListItemDTO,
  ExperienceStatsDTO,
  CreateExperienceDTO,
  UpdateExperienceDTO,
  ListExperiencesQueryDTO,
  PublicExperienceQueryDTO,
  BulkExperienceStatusDTO,
  BulkExperienceDeleteDTO,
  ReorderExperiencesDTO,
} from "./ExperienceDTO";

export class ExperienceService {
  private logger = new AppLogger("ExperienceService");

  constructor(private readonly db: typeof prisma = prisma) {}

  /**
   * Helper to format raw database Experience record into full ExperienceDTO
   */
  private formatExperience(exp: Experience): ExperienceDTO {
    let parsedStats: any[] = [];
    if (typeof exp.stats === "string") {
      try {
        parsedStats = JSON.parse(exp.stats);
      } catch {
        parsedStats = [];
      }
    } else if (Array.isArray(exp.stats)) {
      parsedStats = exp.stats;
    }

    return {
      id: exp.id,
      company: exp.company,
      companyUrl: exp.companyUrl,
      companyLogo: exp.companyLogo,
      role: exp.role,
      title: Array.isArray(exp.title) ? exp.title : [],
      location: exp.location,
      employmentType: exp.employmentType,
      period: exp.period,
      year: exp.year,
      startDate: exp.startDate ? exp.startDate.toISOString() : null,
      endDate: exp.endDate ? exp.endDate.toISOString() : null,
      isCurrent: exp.isCurrent,
      description: exp.description,
      highlights: Array.isArray(exp.highlights) ? exp.highlights : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      stats: parsedStats,
      learned: exp.learned,
      status: exp.status as ExperienceStatus,
      featured: exp.featured,
      order: exp.order,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
    };
  }

  // =========================================================================
  // ADMIN DASHBOARD QUERIES & STATS
  // =========================================================================

  /**
   * Get aggregated overview KPI metrics for the experiences dashboard
   */
  public async getStats(): Promise<ExperienceStatsDTO> {
    const [
      totalExperiences,
      publishedCount,
      draftCount,
      archivedCount,
      currentRolesCount,
      allExperiences,
    ] = await Promise.all([
      this.db.experience.count(),
      this.db.experience.count({ where: { status: ExperienceStatus.PUBLISHED } }),
      this.db.experience.count({ where: { status: ExperienceStatus.DRAFT } }),
      this.db.experience.count({ where: { status: ExperienceStatus.ARCHIVED } }),
      this.db.experience.count({ where: { isCurrent: true } }),
      this.db.experience.findMany({
        select: {
          company: true,
          technologies: true,
        },
      }),
    ]);

    // Calculate unique companies
    const uniqueCompanies = new Set(
      allExperiences.map((e) => e.company.trim().toLowerCase())
    );

    // Calculate technologies breakdown
    const techCounts: Record<string, number> = {};
    for (const exp of allExperiences) {
      if (Array.isArray(exp.technologies)) {
        for (const tech of exp.technologies) {
          const trimmed = tech.trim();
          if (trimmed) {
            techCounts[trimmed] = (techCounts[trimmed] || 0) + 1;
          }
        }
      }
    }

    const topTechnologies = Object.entries(techCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalExperiences,
      publishedCount,
      draftCount,
      archivedCount,
      currentRolesCount,
      totalCompaniesCount: uniqueCompanies.size,
      totalTechnologiesCount: Object.keys(techCounts).length,
      topTechnologies,
    };
  }

  /**
   * List experiences with search, filters, pagination, and sorting for Admin Dashboard
   */
  public async getAllAdmin(query: ListExperiencesQueryDTO): Promise<{
    data: ExperienceListItemDTO[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.ExperienceWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    if (query.employmentType) {
      where.employmentType = {
        contains: query.employmentType,
        mode: "insensitive",
      };
    }

    if (query.tech) {
      where.technologies = {
        has: query.tech,
      };
    }

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { company: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { learned: { contains: search, mode: "insensitive" } },
        { year: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ExperienceOrderByWithRelationInput = { order: "asc" };
    if (query.sortBy === "createdAt") {
      orderBy = { createdAt: query.sortOrder || "desc" };
    } else if (query.sortBy === "company") {
      orderBy = { company: query.sortOrder || "asc" };
    } else if (query.sortBy === "role") {
      orderBy = { role: query.sortOrder || "asc" };
    } else if (query.sortBy === "year") {
      orderBy = { year: query.sortOrder || "desc" };
    } else {
      orderBy = { order: query.sortOrder || "asc" };
    }

    const [total, experiences] = await Promise.all([
      this.db.experience.count({ where }),
      this.db.experience.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: experiences.map((exp) => this.formatExperience(exp)),
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
   * Get single experience by ID
   */
  public async getById(id: string): Promise<ExperienceDTO> {
    const experience = await this.db.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      throw new NotFoundError(`Experience with ID '${id}' not found`);
    }

    return this.formatExperience(experience);
  }

  /**
   * Create a new experience
   */
  public async create(dto: CreateExperienceDTO): Promise<ExperienceDTO> {
    // If title array wasn't passed or is empty, auto-generate split from role
    let title = dto.title || [];
    if (title.length === 0 && dto.role) {
      const parts = dto.role.split(" ");
      if (parts.length >= 2) {
        title = [parts.slice(0, -1).join(" "), parts[parts.length - 1] || ""];
      } else {
        title = [dto.role];
      }
    }

    // Auto-compute order if 0 or not provided
    let order = dto.order;
    if (order === undefined || order === 0) {
      const maxOrder = await this.db.experience.aggregate({
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? -1) + 1;
    }

    const experience = await this.db.experience.create({
      data: {
        company: dto.company.trim(),
        companyUrl: dto.companyUrl || null,
        companyLogo: dto.companyLogo || null,
        role: dto.role.trim(),
        title,
        location: dto.location.trim(),
        employmentType: dto.employmentType || "Full-Time",
        period: dto.period.trim(),
        year: dto.year.trim(),
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isCurrent: dto.isCurrent ?? false,
        description: dto.description.trim(),
        highlights: dto.highlights || [],
        technologies: dto.technologies || [],
        stats: (dto.stats as any) || [],
        learned: dto.learned || null,
        status: (dto.status as ExperienceStatus) || ExperienceStatus.PUBLISHED,
        featured: dto.featured ?? true,
        order,
      },
    });

    this.logger.info(`✔ Experience created successfully: '${experience.company} - ${experience.role}'`);
    return this.formatExperience(experience);
  }

  /**
   * Update an existing experience
   */
  public async update(id: string, dto: UpdateExperienceDTO): Promise<ExperienceDTO> {
    const existing = await this.db.experience.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Experience with ID '${id}' not found`);
    }

    const data: Prisma.ExperienceUpdateInput = {};

    if (dto.company !== undefined) data.company = dto.company.trim();
    if (dto.companyUrl !== undefined) data.companyUrl = dto.companyUrl || null;
    if (dto.companyLogo !== undefined) data.companyLogo = dto.companyLogo || null;
    if (dto.role !== undefined) data.role = dto.role.trim();
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.employmentType !== undefined) data.employmentType = dto.employmentType;
    if (dto.period !== undefined) data.period = dto.period.trim();
    if (dto.year !== undefined) data.year = dto.year.trim();
    if (dto.startDate !== undefined) data.startDate = dto.startDate ? new Date(dto.startDate) : null;
    if (dto.endDate !== undefined) data.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.isCurrent !== undefined) data.isCurrent = dto.isCurrent;
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.highlights !== undefined) data.highlights = dto.highlights;
    if (dto.technologies !== undefined) data.technologies = dto.technologies;
    if (dto.stats !== undefined) data.stats = dto.stats as any;
    if (dto.learned !== undefined) data.learned = dto.learned || null;
    if (dto.status !== undefined) data.status = dto.status as ExperienceStatus;
    if (dto.featured !== undefined) data.featured = dto.featured;
    if (dto.order !== undefined) data.order = dto.order;

    const updated = await this.db.experience.update({
      where: { id },
      data,
    });

    this.logger.info(`✔ Experience updated successfully: '${updated.id}'`);
    return this.formatExperience(updated);
  }

  /**
   * Delete an experience
   */
  public async delete(id: string): Promise<{ id: string }> {
    const existing = await this.db.experience.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Experience with ID '${id}' not found`);
    }

    await this.db.experience.delete({
      where: { id },
    });

    this.logger.info(`✔ Experience deleted: '${id}'`);
    return { id };
  }

  /**
   * Duplicate an experience into a draft
   */
  public async duplicate(id: string): Promise<ExperienceDTO> {
    const original = await this.db.experience.findUnique({
      where: { id },
    });

    if (!original) {
      throw new NotFoundError(`Experience with ID '${id}' not found`);
    }

    const maxOrder = await this.db.experience.aggregate({
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? original.order) + 1;

    const duplicated = await this.db.experience.create({
      data: {
        company: `${original.company} (Copy)`,
        companyUrl: original.companyUrl,
        companyLogo: original.companyLogo,
        role: original.role,
        title: original.title,
        location: original.location,
        employmentType: original.employmentType,
        period: original.period,
        year: original.year,
        startDate: original.startDate,
        endDate: original.endDate,
        isCurrent: original.isCurrent,
        description: original.description,
        highlights: original.highlights,
        technologies: original.technologies,
        stats: original.stats ?? [],
        learned: original.learned,
        status: ExperienceStatus.DRAFT,
        featured: original.featured,
        order: nextOrder,
      },
    });

    this.logger.info(`✔ Experience duplicated: '${original.id}' -> '${duplicated.id}'`);
    return this.formatExperience(duplicated);
  }

  /**
   * Bulk update status (Publish, Draft, Archive)
   */
  public async bulkUpdateStatus(dto: BulkExperienceStatusDTO): Promise<{ count: number }> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestError("No IDs provided for bulk status update");
    }

    const result = await this.db.experience.updateMany({
      where: { id: { in: dto.ids } },
      data: { status: dto.status as ExperienceStatus },
    });

    this.logger.info(`✔ Bulk status update: ${result.count} experiences set to ${dto.status}`);
    return { count: result.count };
  }

  /**
   * Bulk delete experiences
   */
  public async bulkDelete(dto: BulkExperienceDeleteDTO): Promise<{ count: number }> {
    if (!dto.ids || dto.ids.length === 0) {
      throw new BadRequestError("No IDs provided for bulk deletion");
    }

    const result = await this.db.experience.deleteMany({
      where: { id: { in: dto.ids } },
    });

    this.logger.info(`✔ Bulk delete: ${result.count} experiences deleted`);
    return { count: result.count };
  }

  /**
   * Reorder experiences
   */
  public async reorder(dto: ReorderExperiencesDTO): Promise<{ updated: number }> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestError("No items provided for reordering");
    }

    await this.db.$transaction(
      dto.items.map((item) =>
        this.db.experience.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    this.logger.info(`✔ Reordered ${dto.items.length} experiences`);
    return { updated: dto.items.length };
  }

  // =========================================================================
  // PUBLIC DISCOVERY
  // =========================================================================

  /**
   * Get published experiences for public frontend & SSR
   */
  public async getPublicExperiences(
    query: PublicExperienceQueryDTO = {}
  ): Promise<ExperienceDTO[]> {
    const where: Prisma.ExperienceWhereInput = {
      status: ExperienceStatus.PUBLISHED,
    };

    if (query.featured !== undefined) {
      where.featured = query.featured;
    }

    const experiences = await this.db.experience.findMany({
      where,
      orderBy: { order: "asc" },
      take: query.limit,
    });

    return experiences.map((exp) => this.formatExperience(exp));
  }

  /**
   * Reset / Seed initial default experience
   */
  public async seedDefault(): Promise<{ created: number; message: string }> {
    const defaultData = [
      {
        company: "Softvence Agency",
        companyUrl: "https://softvence.agency",
        role: "FULL STACK DEVELOPER",
        title: ["FULL STACK", "DEVELOPER"],
        location: "Dhaka, Bangladesh · Remote-Friendly",
        employmentType: "Full-Time",
        period: "PRESENT // 14 MO",
        year: "2025",
        isCurrent: true,
        description:
          "Architected type-safe backend systems with TypeScript, Express.js, and Prisma ORM, integrated with React.js frontends to deliver responsive, high-performance applications.",
        highlights: [
          "Decoupled intensive background tasks like email and AI processing using RabbitMQ message brokers",
          "Improved database query latency and API response times by implementing Redis caching",
          "Built granular role-based access control (RBAC), real-time WebSockets, and Stripe/Paystack tiered subscription billing",
          "Containerized multi-service environments with Docker and managed VPS deployments with AWS S3/MinIO media storage",
        ],
        technologies: [
          "TypeScript",
          "Express.js",
          "Prisma ORM",
          "PostgreSQL",
          "Redis",
          "RabbitMQ",
          "WebSockets",
          "Stripe",
          "Paystack",
          "Docker",
          "AWS S3",
          "MinIO",
          "Linux VPS",
        ],
        stats: [
          { label: "Background Queues", value: "RabbitMQ" },
          { label: "Billing Systems", value: "Stripe & Paystack" },
          { label: "Storage Providers", value: "AWS S3 / MinIO" },
        ],
        learned:
          "Mastered decoupling intensive background jobs and optimizing database access patterns to ensure seamless scalability and real-time reliability under load.",
        status: ExperienceStatus.PUBLISHED,
        featured: true,
        order: 0,
      },
    ];

    let created = 0;
    for (const exp of defaultData) {
      const existing = await this.db.experience.findFirst({
        where: { company: exp.company, role: exp.role },
      });

      if (!existing) {
        await this.db.experience.create({ data: exp });
        created++;
      } else {
        await this.db.experience.update({
          where: { id: existing.id },
          data: exp,
        });
        created++;
      }
    }

    return {
      created,
      message: `Successfully seeded ${created} default experience records.`,
    };
  }
}
