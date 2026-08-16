import type {
  AuthUser,
  BlogComment,
  PostReactions,
  Role,
} from "@workspace/shared"

export type { AuthUser, BlogComment, PostReactions, Role }

export const DEMO_USERS: AuthUser[] = [
  {
    id: "user-fi",
    name: "Fi Amanillah",
    username: "fiamanillah",
    email: "fi@amanillah.dev",
    avatar: "/fi.png",
    role: "Author & Lead Architect",
    badge: "Author",
    bio: "Full Stack & DevOps Engineer building high-throughput distributed systems.",
    joinedAt: "2024-01-01",
    location: "Singapore / Remote",
    website: "https://amanillah.dev",
    githubUrl: "https://github.com/fiamanillah",
    twitterUrl: "https://twitter.com/fiamanillah",
    linkedinUrl: "https://linkedin.com/in/fiamanillah",
    pronouns: "he/him",
    customStatus: "⚡ Optimizing distributed queues",
    subscribedToNewsletter: true,
    twoFactorEnabled: true,
  },
  {
    id: "user-alex",
    name: "Alex Chen",
    username: "alexchen_dev",
    email: "alex@chen.io",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "Senior Frontend Engineer",
    badge: "Core Contributor",
    bio: "React & TypeScript enthusiast. Building reactive UI systems and design infrastructure.",
    joinedAt: "2024-03-15",
    location: "San Francisco, CA",
    website: "https://alexchen.dev",
    githubUrl: "https://github.com/alexchen",
    twitterUrl: "https://twitter.com/alexchen_dev",
    linkedinUrl: "https://linkedin.com/in/alexchen",
    pronouns: "they/them",
    customStatus: "🎨 Crafting fluid micro-interactions",
    subscribedToNewsletter: true,
    twoFactorEnabled: false,
  },
  {
    id: "user-sarah",
    name: "Sarah Lin",
    username: "sarahlin_sre",
    email: "sarah@cloudops.net",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Staff SRE & Distributed Systems",
    badge: "SRE Lead",
    bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
    joinedAt: "2024-02-20",
    location: "Seattle, WA",
    website: "https://sarahlin.cloud",
    githubUrl: "https://github.com/sarahlin",
    twitterUrl: "https://twitter.com/sarahlin_sre",
    linkedinUrl: "https://linkedin.com/in/sarahlin",
    pronouns: "she/her",
    customStatus: "☸️ Tuning Kubernetes cluster mesh",
    subscribedToNewsletter: true,
    twoFactorEnabled: true,
  },
  {
    id: "user-marcus",
    name: "Marcus Vance",
    username: "marcus_v",
    email: "marcus@secops.io",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "Security & Cloud Architect",
    badge: "Security Pro",
    bio: "Hardening production infrastructure, zero-trust APIs, and automated CI/CD security.",
    joinedAt: "2024-05-10",
    location: "Berlin, Germany",
    website: "https://secops.vance.io",
    githubUrl: "https://github.com/marcusvance",
    twitterUrl: "https://twitter.com/marcus_secops",
    linkedinUrl: "https://linkedin.com/in/marcusvance",
    pronouns: "he/him",
    customStatus: "🛡️ Zero-trust vulnerability audit",
    subscribedToNewsletter: false,
    twoFactorEnabled: true,
  },
]

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
