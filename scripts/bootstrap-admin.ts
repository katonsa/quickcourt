import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { z } from "zod"

import { PrismaClient } from "../generated/prisma/client"

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .trim()
    .min(1, "DATABASE_URL is required")
    .refine(isPostgresUrl, "DATABASE_URL must be a PostgreSQL connection URL"),
  ADMIN_BOOTSTRAP_EMAIL: z
    .string()
    .trim()
    .email("ADMIN_BOOTSTRAP_EMAIL must be a valid email address"),
})

const scriptEnv = parseScriptEnv()

const adapter = new PrismaPg({
  connectionString: scriptEnv.DATABASE_URL,
})
const db = new PrismaClient({ adapter })

async function main(): Promise<void> {
  const email = scriptEnv.ADMIN_BOOTSTRAP_EMAIL
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
    },
  })

  if (!user) {
    throw new Error(
      "Admin bootstrap user does not exist. Create the user through Better Auth first, then rerun this script."
    )
  }

  if (user.role === "admin") {
    console.info("Admin bootstrap user is already promoted.")
    return
  }

  await db.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  })

  console.info("Admin bootstrap user promoted to admin.")
}

function isPostgresUrl(value: string): boolean {
  try {
    const url = new URL(value)

    return url.protocol === "postgresql:" || url.protocol === "postgres:"
  } catch {
    return false
  }
}

function parseScriptEnv(): z.infer<typeof envSchema> {
  const parsedEnv = envSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    throw new Error(
      parsedEnv.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n")
    )
  }

  return parsedEnv.data
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
