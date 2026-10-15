import { defineConfig } from "vitest/config";

process.loadEnvFile(".env.test");

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,

    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
        },
      },
    ],
  },
});