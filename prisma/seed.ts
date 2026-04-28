import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../generated/prisma/client"

const appEnv = resolveAppEnv()
const databaseUrl = readDatabaseUrl()
const adapter = new PrismaPg({ connectionString: databaseUrl })
const db = new PrismaClient({ adapter })

const sampleAdminUserId = "seed_admin_user"
const sampleRegularUserId = "seed_regular_user"
const sampleOwnerUserId = "seed_venue_owner_user"
const sampleStaffUserId = "seed_venue_staff_user"
const sampleOrganizationId = "seed_quickcourt_demo_org"
const sampleOwnerMemberId = "seed_quickcourt_demo_owner_member"
const sampleStaffMemberId = "seed_quickcourt_demo_staff_member"

async function main(): Promise<void> {
  await seedPlatformSettings()

  if (appEnv === "development" || appEnv === "test") {
    await seedDevelopmentOrganization()
  } else {
    console.info(
      "Skipping development sample organization seed outside dev/test."
    )
  }
}

async function seedPlatformSettings(): Promise<void> {
  await db.platformSetting.upsert({
    where: { key: "default_commission_bps" },
    update: {
      value: { bps: 1000 },
      description: "Default platform commission in basis points.",
    },
    create: {
      key: "default_commission_bps",
      value: { bps: 1000 },
      description: "Default platform commission in basis points.",
    },
  })

  await db.platformSetting.upsert({
    where: { key: "default_cancellation_policy" },
    update: {
      value: {
        currency: "IDR",
        refundWindowHours: 24,
        beforeWindowRefundPercent: 100,
        withinWindowRefundPercent: 0,
      },
      description: "Default MVP cancellation/refund policy snapshot source.",
    },
    create: {
      key: "default_cancellation_policy",
      value: {
        currency: "IDR",
        refundWindowHours: 24,
        beforeWindowRefundPercent: 100,
        withinWindowRefundPercent: 0,
      },
      description: "Default MVP cancellation/refund policy snapshot source.",
    },
  })
}

async function seedDevelopmentOrganization(): Promise<void> {
  // Guard verification identities only. Do not raw-seed Better Auth passwords.
  await seedUser({
    id: sampleAdminUserId,
    name: "Demo Admin",
    email: "admin.demo@quickcourt.test",
    role: "admin",
  })

  await seedUser({
    id: sampleRegularUserId,
    name: "Demo Regular User",
    email: "user.demo@quickcourt.test",
    role: "user",
  })

  await seedUser({
    id: sampleOwnerUserId,
    name: "Demo Venue Owner",
    email: "owner.demo@quickcourt.test",
    role: "user",
  })

  await seedUser({
    id: sampleStaffUserId,
    name: "Demo Venue Staff",
    email: "staff.demo@quickcourt.test",
    role: "user",
  })

  await db.organization.upsert({
    where: { id: sampleOrganizationId },
    update: {
      name: "QuickCourt Demo Venue",
      slug: "quickcourt-demo-venue",
      metadata: JSON.stringify({ seeded: true, scope: "development-test" }),
    },
    create: {
      id: sampleOrganizationId,
      name: "QuickCourt Demo Venue",
      slug: "quickcourt-demo-venue",
      createdAt: new Date(),
      metadata: JSON.stringify({ seeded: true, scope: "development-test" }),
    },
  })

  await db.member.upsert({
    where: { id: sampleOwnerMemberId },
    update: {
      organizationId: sampleOrganizationId,
      userId: sampleOwnerUserId,
      role: "owner",
    },
    create: {
      id: sampleOwnerMemberId,
      organizationId: sampleOrganizationId,
      userId: sampleOwnerUserId,
      role: "owner",
      createdAt: new Date(),
    },
  })

  await db.member.upsert({
    where: { id: sampleStaffMemberId },
    update: {
      organizationId: sampleOrganizationId,
      userId: sampleStaffUserId,
      role: "member",
    },
    create: {
      id: sampleStaffMemberId,
      organizationId: sampleOrganizationId,
      userId: sampleStaffUserId,
      role: "member",
      createdAt: new Date(),
    },
  })
}

type SeedUserInput = {
  id: string
  name: string
  email: string
  role: "admin" | "user"
}

async function seedUser({ id, name, email, role }: SeedUserInput): Promise<void> {
  await db.user.upsert({
    where: { id },
    update: {
      name,
      email,
      emailVerified: true,
      role,
    },
    create: {
      id,
      name,
      email,
      emailVerified: true,
      role,
    },
  })
}

function resolveAppEnv(): "development" | "test" | "staging" | "production" {
  const appEnv = process.env.APP_ENV

  if (
    appEnv === "development" ||
    appEnv === "test" ||
    appEnv === "staging" ||
    appEnv === "production"
  ) {
    return appEnv
  }

  if (process.env.NODE_ENV === "test") {
    return "test"
  }

  if (process.env.NODE_ENV === "production") {
    return "production"
  }

  return "development"
}

function readDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim()

  if (!value) {
    throw new Error("DATABASE_URL is required to run the database seed.")
  }

  const url = new URL(value)

  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must be a PostgreSQL connection URL.")
  }

  return value
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
