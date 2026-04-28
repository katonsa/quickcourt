"use client"

import { createAuthClient } from "better-auth/client"
import { adminClient, organizationClient } from "better-auth/client/plugins"

import { publicEnv } from "@/config/public-env"

export const authClient = createAuthClient({
  baseURL: publicEnv.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient(), organizationClient()],
})
