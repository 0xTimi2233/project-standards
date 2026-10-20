import { existsSync, statSync } from "node:fs";
import { cp, copyFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { ROOT_DIR, loadManifest } from "../config.ts";

export interface InitOptions {
  silent?: boolean;
}

export async function initLocalBaseline(targetPath: string, options: InitOptions = {}): Promise<void> {
  const targetDir = resolve(process.cwd(), targetPath);
  if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
    throw new Error(`invalid target directory: ${targetDir}`);
  }

  const log = (msg: string) => {
    if (!options.silent) {
      console.log(msg);
    }
  };

  log(`[init] target: ${targetDir}`);
  const manifest = await loadManifest();

  for (const entry of manifest.entries) {
    const srcPath = resolve(ROOT_DIR, entry.src);
    const destPath = resolve(targetDir, entry.dest);

    if (!existsSync(srcPath)) {
      log(`[warn] source missing: ${entry.src}`);
      continue;
    }

    const srcStat = statSync(srcPath);
    await mkdir(dirname(destPath), { recursive: true });

    switch (entry.strategy) {
      case "overwrite": {
        if (srcStat.isDirectory()) {
          await cp(srcPath, destPath, { recursive: true, force: true });
        } else {
          await copyFile(srcPath, destPath);
        }
        log(`[copy] ${entry.dest}`);
        break;
      }
      case "create-only": {
        if (existsSync(destPath)) {
          log(`[skip] ${entry.dest} (exists)`);
        } else {
          if (srcStat.isDirectory()) {
            await cp(srcPath, destPath, { recursive: true, force: true });
          } else {
            await copyFile(srcPath, destPath);
          }
          log(`[copy] ${entry.dest}`);
        }
        break;
      }
      case "merge-lines": {
        const { mergeGitignore } = await import("./gitignore.ts");
        const res = await mergeGitignore(srcPath, destPath);
        if (res.created) {
          log(`[copy] ${entry.dest}`);
        } else if (res.appendedCount > 0) {
          log(`[merge] ${entry.dest} (+${res.appendedCount} patterns)`);
        } else {
          log(`[skip] ${entry.dest} (up to date)`);
        }
        break;
      }
    }
  }

  log(`[done] local baseline initialized`);
}
