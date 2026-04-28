import "server-only"

import { PrismaPg } from "@prisma/adapter-pg"

import { env } from "@/config/env"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

  return new PrismaClient({ adapter })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}

export const prisma = db
