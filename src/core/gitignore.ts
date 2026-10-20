import { existsSync } from "node:fs";
import { readFile, appendFile, copyFile } from "node:fs/promises";

export interface MergeGitignoreResult {
  created: boolean;
  appendedCount: number;
}

export async function mergeGitignore(srcPath: string, destPath: string): Promise<MergeGitignoreResult> {
  if (!existsSync(destPath)) {
    await copyFile(srcPath, destPath);
    return { created: true, appendedCount: 0 };
  }

  const srcContent = await readFile(srcPath, "utf-8");
  const destContent = await readFile(destPath, "utf-8");

  const destPatterns = new Set(
    destContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
  );

  const missingPatterns = srcContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#") && !destPatterns.has(line));

  if (missingPatterns.length === 0) {
    return { created: false, appendedCount: 0 };
  }

  const separator = destContent.endsWith("\n") ? "" : "\n";
  const patch = `${separator}\n# --- Standard Baseline Ignore Rules ---\n${missingPatterns.join("\n")}\n`;
  await appendFile(destPath, patch, "utf-8");

  return { created: false, appendedCount: missingPatterns.length };
}
