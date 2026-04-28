import { defineConfig, mergeConfig } from "vitest/config"

import baseConfig from "./vitest.config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      hookTimeout: 15_000,
      include: ["**/*.integration.test.ts"],
      setupFiles: ["./test/setup.ts", "./test/integration/setup.ts"],
      testTimeout: 15_000,
    },
  })
)
