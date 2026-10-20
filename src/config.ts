import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Manifest } from "@/types.ts";

const currentDir = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = resolve(currentDir, "..");
export const MANIFEST_PATH = resolve(ROOT_DIR, "manifest.json");

export async function loadManifest(): Promise<Manifest> {
  const file = Bun.file(MANIFEST_PATH);
  if (!(await file.exists())) {
    throw new Error(`manifest not found: ${MANIFEST_PATH}`);
  }
  return (await file.json()) as Manifest;
}
