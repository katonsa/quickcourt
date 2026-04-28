import { describe, expect, it } from "vitest"

import { cn } from "@/lib/utils"

describe("Vitest harness", () => {
  it("runs node unit tests", () => {
    expect(process.env.NODE_ENV).toBe("test")
  })

  it("resolves app path aliases", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
