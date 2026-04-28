import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
    },
    environment: "node",
    pool: "forks",
    restoreMocks: true,
    setupFiles: ["./test/setup.ts"],
  },
})
