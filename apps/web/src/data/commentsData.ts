import type {
  AuthUser,
  BlogComment,
  PostReactions,
  Role,
} from "@workspace/shared"

export type { AuthUser, BlogComment, PostReactions, Role }

export const DEMO_USERS: AuthUser[] = []

export const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
]

// Pure dynamic defaults (all comments and reactions come from the backend API/Database)
export const DEFAULT_REACTIONS_REGISTRY: Record<string, PostReactions> = {}
export const DEFAULT_COMMENTS_REGISTRY: Record<string, BlogComment[]> = {}
