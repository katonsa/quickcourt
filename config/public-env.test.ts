import { describe, expect, it } from "vitest"

import { createPublicEnv } from "./public-env"

describe("createPublicEnv", () => {
  it("parses browser-safe public env values", () => {
    expect(
      createPublicEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_APP_ENV: "staging",
        NEXT_PUBLIC_APP_URL: "https://quickcourt.example",
      })
    ).toEqual({
      NEXT_PUBLIC_APP_ENV: "staging",
      NEXT_PUBLIC_APP_URL: "https://quickcourt.example",
    })
  })

  it("rejects invalid public URLs", () => {
    expect(() =>
      createPublicEnv({
        NODE_ENV: "test",
        NEXT_PUBLIC_APP_URL: "not-a-url",
      })
    ).toThrow(/NEXT_PUBLIC_APP_URL[\s\S]*valid absolute URL/)
  })
})
