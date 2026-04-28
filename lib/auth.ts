import "server-only"

import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin, organization } from "better-auth/plugins"

import { env } from "@/config/env"
import { db } from "@/lib/db"
import { emailSender } from "@/lib/email/email-sender"
import { logger } from "@/lib/logger"

const hostedAppEnv = env.APP_ENV === "production" || env.APP_ENV === "staging"

export const auth = betterAuth({
  appName: "QuickCourt",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [...new Set([env.APP_URL, env.BETTER_AUTH_URL])],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
    sendResetPassword: async ({ user, url }) => {
      await emailSender.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        url,
      })
    },
    onPasswordReset: async ({ user }) => {
      logger.info({ userId: user.id }, "User password reset completed")
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await emailSender.sendVerificationEmail({
        to: user.email,
        name: user.name,
        url,
      })
    },
    afterEmailVerification: async (user) => {
      logger.info({ userId: user.id }, "User email verified")
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    organization({
      allowUserToCreateOrganization: false,
      creatorRole: "owner",
      requireEmailVerificationOnInvitation: true,
    }),
  ],
  rateLimit: {
    enabled: hostedAppEnv,
    window: 60,
    max: 100,
    storage: "memory",
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60 * 60,
        max: 5,
      },
      "/request-password-reset": {
        window: 60 * 15,
        max: 3,
      },
      "/reset-password": {
        window: 60 * 15,
        max: 5,
      },
      "/send-verification-email": {
        window: 60 * 15,
        max: 3,
      },
    },
  },
})

export type Auth = typeof auth
