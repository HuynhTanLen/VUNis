// prisma.config.ts — Cấu hình Prisma 7
// Prisma 7 yêu cầu đặt DATABASE_URL ở đây thay vì trong schema.prisma
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: env("DATABASE_URL"),
    },
});
