import { describe, expect, it, vi } from "vitest"

type EmailHookInput = {
  user: {
    email: string
    name?: string | null
  }
  url: string
}

type AuthConfig = {
  appName: string
  baseURL: string
  basePath: string
  secret: string
  trustedOrigins: string[]
  database: unknown
  emailAndPassword: {
    enabled: boolean
    requireEmailVerification: boolean
    minPasswordLength: number
    maxPasswordLength: number
    autoSignIn: boolean
    revokeSessionsOnPasswordReset: boolean
    sendResetPassword: (input: EmailHookInput) => Promise<void>
  }
  emailVerification: {
    sendOnSignUp: boolean
    sendOnSignIn: boolean
    autoSignInAfterVerification: boolean
    expiresIn: number
    sendVerificationEmail: (input: EmailHookInput) => Promise<void>
  }
  plugins: unknown[]
  rateLimit: {
    enabled: boolean
    window: number
    max: number
    storage: string
    customRules: Record<
      string,
      {
        window: number
        max: number
      }
    >
  }
}

const mocks = vi.hoisted(() => {
  const state = {
    adminOptions: undefined as unknown,
    authConfig: undefined as unknown,
    hostedAppEnvInput: undefined as unknown,
    organizationOptions: undefined as unknown,
    prismaAdapterInput: undefined as unknown,
    prismaAdapterOptions: undefined as unknown,
  }

  const adminPlugin = { plugin: "admin" }
  const authReturn = { api: { getSession: vi.fn() } }
  const databaseAdapter = { adapter: "prisma" }
  const db = { mocked: "db" }
  const organizationPlugin = { plugin: "organization" }

  return {
    admin: vi.fn((options: unknown) => {
      state.adminOptions = options

      return adminPlugin
    }),
    adminPlugin,
    authReturn,
    betterAuth: vi.fn((config: unknown) => {
      state.authConfig = config

      return authReturn
    }),
    databaseAdapter,
    db,
    env: {
      APP_ENV: "staging",
      APP_URL: "https://quickcourt.test",
      BETTER_AUTH_SECRET: "test-better-auth-secret-with-32-chars",
      BETTER_AUTH_URL: "https://auth.quickcourt.test",
    },
    isHostedAppEnv: vi.fn((appEnv: unknown) => {
      state.hostedAppEnvInput = appEnv

      return true
    }),
    loggerInfo: vi.fn(),
    organization: vi.fn((options: unknown) => {
      state.organizationOptions = options

      return organizationPlugin
    }),
    organizationPlugin,
    prismaAdapter: vi.fn((inputDb: unknown, options: unknown) => {
      state.prismaAdapterInput = inputDb
      state.prismaAdapterOptions = options

      return databaseAdapter
    }),
    sendPasswordResetEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
    state,
  }
})

vi.mock("server-only", () => ({}))

vi.mock("better-auth", () => ({
  betterAuth: mocks.betterAuth,
}))

vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter: mocks.prismaAdapter,
}))

vi.mock("better-auth/plugins", () => ({
  admin: mocks.admin,
  organization: mocks.organization,
}))

vi.mock("@/config/env", () => ({
  env: mocks.env,
  isHostedAppEnv: mocks.isHostedAppEnv,
}))

vi.mock("@/lib/db", () => ({
  db: mocks.db,
}))

vi.mock("@/lib/email/email-sender", () => ({
  emailSender: {
    sendPasswordResetEmail: mocks.sendPasswordResetEmail,
    sendVerificationEmail: mocks.sendVerificationEmail,
  },
}))

vi.mock("@/lib/logger", () => ({
  logger: {
    info: mocks.loggerInfo,
  },
}))

import { auth } from "@/lib/auth"

describe("auth configuration", () => {
  it("passes QuickCourt app identity and route settings to Better Auth", () => {
    const config = getAuthConfig()

    expect(auth).toBe(mocks.authReturn)
    expect(config.appName).toBe("QuickCourt")
    expect(config.baseURL).toBe(mocks.env.BETTER_AUTH_URL)
    expect(config.basePath).toBe("/api/auth")
    expect(config.secret).toBe(mocks.env.BETTER_AUTH_SECRET)
    expect(config.trustedOrigins).toEqual([
      mocks.env.APP_URL,
      mocks.env.BETTER_AUTH_URL,
    ])
    expect(mocks.state.prismaAdapterInput).toBe(mocks.db)
    expect(mocks.state.prismaAdapterOptions).toEqual({ provider: "postgresql" })
    expect(config.database).toBe(mocks.databaseAdapter)
  })

  it("sets QuickCourt email and password verification policy", () => {
    const config = getAuthConfig()

    expect(config.emailAndPassword).toMatchObject({
      autoSignIn: false,
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 8,
      requireEmailVerification: true,
      revokeSessionsOnPasswordReset: true,
    })
    expect(config.emailVerification).toMatchObject({
      autoSignInAfterVerification: true,
      expiresIn: 60 * 60,
      sendOnSignIn: true,
      sendOnSignUp: true,
    })
  })

  it("declares admin and organization plugin intent", () => {
    const config = getAuthConfig()

    expect(mocks.state.adminOptions).toEqual({
      adminRoles: ["admin"],
      defaultRole: "user",
    })
    expect(mocks.state.organizationOptions).toEqual({
      allowUserToCreateOrganization: false,
      creatorRole: "owner",
      requireEmailVerificationOnInvitation: true,
    })
    expect(config.plugins).toEqual([
      mocks.adminPlugin,
      mocks.organizationPlugin,
    ])
  })

  it("enables hosted-environment auth rate limiting intent", () => {
    const config = getAuthConfig()

    expect(mocks.state.hostedAppEnvInput).toBe(mocks.env.APP_ENV)
    expect(config.rateLimit).toMatchObject({
      enabled: true,
      max: 100,
      storage: "memory",
      window: 60,
    })
    expect(config.rateLimit.customRules).toEqual({
      "/request-password-reset": {
        max: 3,
        window: 60 * 15,
      },
      "/reset-password": {
        max: 5,
        window: 60 * 15,
      },
      "/send-verification-email": {
        max: 3,
        window: 60 * 15,
      },
      "/sign-in/email": {
        max: 5,
        window: 60,
      },
      "/sign-up/email": {
        max: 5,
        window: 60 * 60,
      },
    })
  })

  it("sends password reset emails through the local sender abstraction", async () => {
    const config = getAuthConfig()

    await config.emailAndPassword.sendResetPassword({
      url: "https://quickcourt.test/reset-password?token=test-token",
      user: {
        email: "player@example.com",
        name: "Court Player",
      },
    })

    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith({
      to: "player@example.com",
      name: "Court Player",
      url: "https://quickcourt.test/reset-password?token=test-token",
    })
  })

  it("sends verification emails through the local sender abstraction", async () => {
    const config = getAuthConfig()

    await config.emailVerification.sendVerificationEmail({
      url: "https://quickcourt.test/verify-email?token=test-token",
      user: {
        email: "player@example.com",
        name: null,
      },
    })

    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      to: "player@example.com",
      name: null,
      url: "https://quickcourt.test/verify-email?token=test-token",
    })
  })
})

function getAuthConfig(): AuthConfig {
  expect(mocks.state.authConfig).toBeDefined()

  return mocks.state.authConfig as AuthConfig
}
