// src/utils/pagination.ts
export interface PaginateFindManyArgs {
  where?: unknown
  include?: unknown
  select?: unknown
  orderBy?: unknown
  skip?: number
  take?: number
  [key: string]: unknown
}

export interface PrismaPaginationDelegate<T> {
  findMany: (args: PaginateFindManyArgs) => Promise<T[]>
  count: (args?: { where?: unknown }) => Promise<number>
}

export async function paginate<T>(
  model: PrismaPaginationDelegate<T>,
  args: Omit<PaginateFindManyArgs, "skip" | "take"> = {},
  page: number = 1,
  limit: number = 10
) {
  const safePage = Math.max(1, page)
  const skip = (safePage - 1) * limit
  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: args.where }),
  ])

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}
