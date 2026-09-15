import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
let directory = path.dirname(fileURLToPath(import.meta.url));
while (directory !== path.dirname(directory)) {
  const manifest = path.join(directory, "package.json");
  if (
    fs.existsSync(manifest) &&
    JSON.parse(fs.readFileSync(manifest, "utf8")).name === "moa-platform"
  )
    break;
  directory = path.dirname(directory);
}
export const projectRoot = directory;
dotenv.config({ path: path.join(projectRoot, ".env") });
export const config = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().default(4000),
    CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
    MONGODB_URI: z.string().min(1),
    JWT_SECRET: z.string().min(32),
  })
  .parse(process.env);
