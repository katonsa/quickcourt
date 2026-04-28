import { configDefaults, defineConfig, mergeConfig } from "vitest/config"

import baseConfig from "./vitest.config"

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, "**/*.integration.test.ts"],
      include: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  })
)
