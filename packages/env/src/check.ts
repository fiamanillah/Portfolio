#!/usr/bin/env bun
import { apiEnvSchema } from "./api.js"
import { webEnvSchema } from "./web.js"
import { dashboardEnvSchema } from "./dashboard.js"
import { dbEnvSchema } from "./db.js"
import { redisEnvSchema } from "./redis.js"
import { loadEnv } from "./loader.js"

function runEnvCheck() {
  console.log("\n🔍 \x1b[1;36mScanning and Validating Monorepo Environment Variables...\x1b[0m\n")

  const env = loadEnv()
  let hasErrors = false

  const suites = [
    { name: "@workspace/db", schema: dbEnvSchema },
    { name: "@workspace/cache", schema: redisEnvSchema },
    { name: "apps/web", schema: webEnvSchema },
    { name: "apps/dashboard", schema: dashboardEnvSchema },
    { name: "apps/api", schema: apiEnvSchema },
  ]


  for (const { name, schema } of suites) {
    const result = schema.safeParse(env)
    if (result.success) {
      console.log(`  \x1b[32m✔\x1b[0m \x1b[1m${name.padEnd(20)}\x1b[0m \x1b[32mPassed\x1b[0m (${Object.keys(result.data).length} variables validated)`)
    } else {
      hasErrors = true
      console.log(`  \x1b[31m✖\x1b[0m \x1b[1m${name.padEnd(20)}\x1b[0m \x1b[31mFailed\x1b[0m`)
      for (const issue of result.error.issues) {
        console.log(`    - \x1b[33m${issue.path.join(".")}\x1b[0m: ${issue.message}`)
      }
    }
  }

  console.log("")
  if (hasErrors) {
    console.error("❌ \x1b[1;31mEnvironment validation failed. Please correct the missing or invalid variables in your .env file.\x1b[0m\n")
    process.exit(1)
  } else {
    console.log("✨ \x1b[1;32mAll environment variables are valid across all monorepo workspaces!\x1b[0m\n")
  }
}

runEnvCheck()
