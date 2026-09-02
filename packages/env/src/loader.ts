import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import type { ZodError } from "zod"

let envLoaded = false

/**
 * Finds the monorepo root directory by searching upwards for turbo.json or root package.json
 */
export function findMonorepoRoot(startDir: string = process.cwd()): string {
  let currentDir = path.resolve(startDir)

  while (currentDir !== path.parse(currentDir).root) {
    const turboPath = path.join(currentDir, "turbo.json")
    const packagePath = path.join(currentDir, "package.json")

    if (fs.existsSync(turboPath)) {
      return currentDir
    }

    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"))
        if (pkg.workspaces) {
          return currentDir
        }
      } catch {
        // Ignore JSON parse errors and continue upward
      }
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) break
    currentDir = parentDir
  }

  return process.cwd()
}

/**
 * Loads environment variables from monorepo root and workspace-local .env files
 */
export function loadEnv(
  forceReload = false
): Record<string, string | undefined> {
  if (envLoaded && !forceReload) {
    return process.env
  }

  // Preserve explicit process.env variables passed in via Docker ARG/ENV, CI, test runners, or deployment container
  const explicitEnv = { ...process.env }
  const isTest =
    process.env.NODE_ENV === "test" ||
    process.env.BUN_ENV === "test" ||
    (typeof process !== "undefined" &&
      Array.isArray(process.argv) &&
      process.argv.some(
        (arg) =>
          arg === "test" ||
          arg.endsWith("test") ||
          arg.includes("test.ts") ||
          arg.includes("spec.ts")
      ))
  const isProd = process.env.NODE_ENV === "production" && !isTest

  const rootDir = findMonorepoRoot()
  const cwd = process.cwd()

  // 1. Root .env (base defaults for monorepo)
  const rootEnvPath = path.join(rootDir, ".env")
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath, override: !isProd && !isTest })
  }

  // 1b. Root .env.production (loaded in production builds)
  if (isProd) {
    const rootEnvProdPath = path.join(rootDir, ".env.production")
    if (fs.existsSync(rootEnvProdPath)) {
      dotenv.config({ path: rootEnvProdPath, override: true })
    }
  }

  // 2. Root .env.local (developer overrides in non-production)
  const rootEnvLocalPath = path.join(rootDir, ".env.local")
  if (fs.existsSync(rootEnvLocalPath)) {
    dotenv.config({ path: rootEnvLocalPath, override: !isProd && !isTest })
  }

  // 2b. Root .env.production.local (machine overrides in production)
  if (isProd) {
    const rootEnvProdLocalPath = path.join(rootDir, ".env.production.local")
    if (fs.existsSync(rootEnvProdLocalPath)) {
      dotenv.config({ path: rootEnvProdLocalPath, override: true })
    }
  }

  // 3. Workspace-specific .env (if different from root)
  if (cwd !== rootDir) {
    const localEnvPath = path.join(cwd, ".env")
    if (fs.existsSync(localEnvPath)) {
      dotenv.config({ path: localEnvPath, override: !isProd && !isTest })
    }

    if (isProd) {
      const localEnvProdPath = path.join(cwd, ".env.production")
      if (fs.existsSync(localEnvProdPath)) {
        dotenv.config({ path: localEnvProdPath, override: true })
      }
    }

    const localEnvLocalPath = path.join(cwd, ".env.local")
    if (fs.existsSync(localEnvLocalPath)) {
      dotenv.config({ path: localEnvLocalPath, override: !isProd && !isTest })
    }

    if (isProd) {
      const localEnvProdLocalPath = path.join(cwd, ".env.production.local")
      if (fs.existsSync(localEnvProdLocalPath)) {
        dotenv.config({ path: localEnvProdLocalPath, override: true })
      }
    }
  }

  // In test mode, enforce NODE_ENV=test and prevent external service calls
  if (isTest) {
    process.env.NODE_ENV = "test"
    process.env.BUN_ENV = "test"
  }

  // Ensure explicitly injected environment variables from CLI, Docker, CI, or shell take absolute precedence over file defaults
  for (const [key, val] of Object.entries(explicitEnv)) {
    if (val !== undefined) {
      process.env[key] = val
    }
  }

  envLoaded = true
  return process.env
}

/**
 * Pretty-formats Zod validation errors for environment variables
 */
export function formatEnvErrors(error: ZodError, scopeName: string): string {
  const issues = error.issues
    .map((issue) => {
      const field = issue.path.join(".")
      return `  - \x1b[31m${field}\x1b[0m: ${issue.message}`
    })
    .join("\n")

  return `\n\x1b[1;31m[Environment Error]\x1b[0m Invalid environment variables in \x1b[1m${scopeName}\x1b[0m:\n${issues}\n`
}
