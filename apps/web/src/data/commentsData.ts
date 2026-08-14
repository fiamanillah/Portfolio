export interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  role?: string
  badge?: string
  bio?: string
  joinedAt?: string
}

export interface BlogComment {
  id: string
  postSlug: string
  author: AuthUser
  content: string
  createdAt: string // ISO string
  likes: number
  isLiked?: boolean
  parentId?: string | null
  replies?: BlogComment[]
}

export interface PostReactions {
  likes: number
  fire: number
  insightful: number
  fast: number
  rocket: number
  userLiked?: boolean
  userReactions?: {
    fire?: boolean
    insightful?: boolean
    fast?: boolean
    rocket?: boolean
  }
}

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
  },
  {
    id: "user-alex",
    name: "Alex Chen",
    username: "alexchen_dev",
    email: "alex@chen.io",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "Senior Frontend Engineer",
    badge: "Core Contributor",
    bio: "React & TypeScript enthusiast. Building reactive UI systems.",
    joinedAt: "2024-03-15",
  },
  {
    id: "user-sarah",
    name: "Sarah Lin",
    username: "sarahlin_sre",
    email: "sarah@cloudops.net",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role: "Staff SRE & Distributed Systems",
    badge: "SRE Lead",
    bio: "Passionate about Kubernetes, Redis Streams, and sub-second latency topologies.",
    joinedAt: "2024-02-20",
  },
  {
    id: "user-marcus",
    name: "Marcus Vance",
    username: "marcus_v",
    email: "marcus@secops.io",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    role: "Security & Cloud Architect",
    badge: "Security Pro",
    bio: "Hardening production infrastructure, zero-trust APIs, and automated CI/CD security.",
    joinedAt: "2024-05-10",
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

export const DEFAULT_REACTIONS_REGISTRY: Record<string, PostReactions> = {
  "building-distributed-systems-websockets-redis": {
    likes: 184,
    fire: 42,
    insightful: 68,
    fast: 31,
    rocket: 53,
  },
  "scaling-rabbitmq-redis": {
    likes: 129,
    fire: 34,
    insightful: 45,
    fast: 22,
    rocket: 38,
  },
  "realtime-websockets-stripe": {
    likes: 96,
    fire: 28,
    insightful: 39,
    fast: 17,
    rocket: 24,
  },
  "docker-vps-cicd-deployment": {
    likes: 152,
    fire: 49,
    insightful: 58,
    fast: 26,
    rocket: 44,
  },
  "prisma-postgres-optimization": {
    likes: 167,
    fire: 55,
    insightful: 72,
    fast: 40,
    rocket: 49,
  },
  "rest-api-security-best-practices": {
    likes: 141,
    fire: 33,
    insightful: 61,
    fast: 19,
    rocket: 35,
  },
  "typescript-monorepo-turbo": {
    likes: 118,
    fire: 25,
    insightful: 48,
    fast: 36,
    rocket: 30,
  },
  "distributed-tracing-opentelemetry": {
    likes: 104,
    fire: 30,
    insightful: 47,
    fast: 21,
    rocket: 28,
  },
  "cicd-artifact-signing-security": {
    likes: 88,
    fire: 21,
    insightful: 37,
    fast: 14,
    rocket: 23,
  },
}

export const DEFAULT_COMMENTS_REGISTRY: Record<string, BlogComment[]> = {
  "building-distributed-systems-websockets-redis": [
    {
      id: "comment-ws-1",
      postSlug: "building-distributed-systems-websockets-redis",
      author: {
        id: "user-sarah",
        name: "Sarah Lin",
        username: "sarahlin_sre",
        email: "sarah@cloudops.net",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        role: "Staff SRE & Distributed Systems",
        badge: "SRE Lead",
      },
      content: "The breakdown of Redis Streams consumer groups with XACK acknowledgments is spot on. How do you handle dead-lettering when a consumer node crashes mid-stream processing without leaving orphaned messages in the Pending Entries List (PEL)?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      likes: 14,
      replies: [
        {
          id: "comment-ws-1-reply-1",
          postSlug: "building-distributed-systems-websockets-redis",
          author: {
            id: "user-fi",
            name: "Fi Amanillah",
            username: "fiamanillah",
            email: "fi@amanillah.dev",
            avatar: "/fi.png",
            role: "Author & Lead Architect",
            badge: "Author",
          },
          parentId: "comment-ws-1",
          content: "Great question, Sarah! We run a lightweight background janitor routine using `XPENDING` and `XCLAIM`. If a pending entry exceeds our 30-second idle threshold (meaning the worker crashed or hung), the janitor reclaims the message ID to a healthy fallback worker. If retry count exceeds 3, we move the payload to a dead-letter stream key `stream:events:deadletter`.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          likes: 21,
        },
        {
          id: "comment-ws-1-reply-2",
          postSlug: "building-distributed-systems-websockets-redis",
          author: {
            id: "user-alex",
            name: "Alex Chen",
            username: "alexchen_dev",
            email: "alex@chen.io",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
            role: "Senior Frontend Engineer",
          },
          parentId: "comment-ws-1",
          content: "We implemented something very similar in our real-time chat gateway and dropped connection thrashing by nearly 85%. The 30-second ping/pong heartbeat safeguard was a huge lifesaver for mobile safari clients entering sleep mode.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          likes: 8,
        },
        {
          id: "comment-ws-1-reply-3",
          postSlug: "building-distributed-systems-websockets-redis",
          author: {
            id: "user-david",
            name: "David Kowalski",
            username: "david_k",
            email: "david@infra.tech",
            avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
            role: "Lead Platform Engineer",
          },
          parentId: "comment-ws-1",
          content: "Did you configure a custom `XAUTOCLAIM` loop or rely strictly on cron workers for PEL sweeps? In high throughput pipelines `XAUTOCLAIM` with `JUSTID` reduces memory copying significantly.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          likes: 12,
        },
        {
          id: "comment-ws-1-reply-4",
          postSlug: "building-distributed-systems-websockets-redis",
          author: {
            id: "user-sarah",
            name: "Sarah Lin",
            username: "sarahlin_sre",
            email: "sarah@cloudops.net",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            role: "Staff SRE & Distributed Systems",
            badge: "SRE Lead",
          },
          parentId: "comment-ws-1",
          content: "Thanks for the thorough explanation Fi! That dead-letter threshold strategy gives us a solid pattern to incorporate into our SLO runbooks.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          likes: 7,
        },
      ],
    },
    {
      id: "comment-ws-2",
      postSlug: "building-distributed-systems-websockets-redis",
      author: {
        id: "user-marcus",
        name: "Marcus Vance",
        username: "marcus_v",
        email: "marcus@secops.io",
        avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        role: "Security & Cloud Architect",
        badge: "Security Pro",
      },
      content: "Excellent article! One quick security suggestion for people deploying this: make sure to validate the initial origin header during the HTTP upgrade handshake before granting ticket-based JWT authentication, otherwise cross-site WebSocket hijacking (CSWSH) can be an attack vector.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      likes: 19,
      replies: [
        {
          id: "comment-ws-2-reply-1",
          postSlug: "building-distributed-systems-websockets-redis",
          author: {
            id: "user-fi",
            name: "Fi Amanillah",
            username: "fiamanillah",
            email: "fi@amanillah.dev",
            avatar: "/fi.png",
            role: "Author & Lead Architect",
            badge: "Author",
          },
          parentId: "comment-ws-2",
          content: "100% agreed Marcus. In production we enforce strict allowed origins check in the NGINX ingress tier before the request even touches the Node.js WebSocket gateway.",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
          likes: 9,
        },
      ],
    },
    {
      id: "comment-ws-3",
      postSlug: "building-distributed-systems-websockets-redis",
      author: {
        id: "user-david",
        name: "David Kowalski",
        username: "david_k",
        email: "david@infra.tech",
        avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
        role: "Lead Platform Engineer",
      },
      content: "How does Redis memory footprint look when keeping 100k messages under `MAXLEN ~ 100000`? Have you benchmarked Redis Cluster vs Redis Sentinel for the Pub/Sub broker layer?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes: 6,
      replies: [],
    },
    {
      id: "comment-ws-4",
      postSlug: "building-distributed-systems-websockets-redis",
      author: {
        id: "user-elena",
        name: "Elena Rostova",
        username: "elena_ops",
        email: "elena@kubestack.io",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
        role: "DevOps & Cloud Architect",
        badge: "DevOps Lead",
      },
      content: "We deployed this Docker Compose topology to our Kubernetes cluster with KEDA auto-scaling based on Redis stream length. The pods scale up smoothly under peak broadcast spikes!",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      likes: 12,
      replies: [],
    },
    {
      id: "comment-ws-5",
      postSlug: "building-distributed-systems-websockets-redis",
      author: {
        id: "user-tariq",
        name: "Tariq Mansoor",
        username: "tariq_m",
        email: "tariq@fintech.dev",
        avatar: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
        role: "Full Stack Engineer",
      },
      content: "The Dockerfile using `oven/bun:1-alpine` is super clean. We trimmed our container build times down from 45s to 8s using bun.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      likes: 5,
      replies: [],
    },
  ],
  "scaling-rabbitmq-redis": [
    {
      id: "comment-rmq-1",
      postSlug: "scaling-rabbitmq-redis",
      author: {
        id: "user-sarah",
        name: "Sarah Lin",
        username: "sarahlin_sre",
        email: "sarah@cloudops.net",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        role: "Staff SRE & Distributed Systems",
      },
      content: "RabbitMQ Dead Letter Exchanges (DLX) combined with exponential backoff queues have saved our production pipelines dozens of times during third-party API outages. Very well explained!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      likes: 11,
      replies: [],
    },
    {
      id: "comment-rmq-2",
      postSlug: "scaling-rabbitmq-redis",
      author: {
        id: "user-alex",
        name: "Alex Chen",
        username: "alexchen_dev",
        email: "alex@chen.io",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role: "Senior Frontend Engineer",
      },
      content: "The diagram showing the separation between edge HTTP gateways and worker pools clarifies why decoupling is essential for keeping UI response times under 50ms.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      likes: 8,
      replies: [],
    },
  ],
  "prisma-postgres-optimization": [
    {
      id: "comment-prisma-1",
      postSlug: "prisma-postgres-optimization",
      author: {
        id: "user-alex",
        name: "Alex Chen",
        username: "alexchen_dev",
        email: "alex@chen.io",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        role: "Senior Frontend Engineer",
      },
      content: "The section on N+1 query elimination with `relationLoadStrategy: 'join'` in Prisma 5+ alone solved our largest slow query bottleck. Benchmark tables are super informative!",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      likes: 17,
      replies: [],
    },
  ],
}

