import { existsSync } from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

export function loadServerEnvironment() {
  let projectRoot = process.cwd();
  if (!existsSync(path.join(projectRoot, ".env.local"))) {
    projectRoot = path.resolve(projectRoot, "..");
  }

  loadEnvConfig(projectRoot);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Supabase server configuration is missing NEXT_PUBLIC_SUPABASE_URL.");
  }
}
