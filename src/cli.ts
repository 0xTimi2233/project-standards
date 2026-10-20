import {
  resolveRepoSlug,
  syncGitHub,
  syncLabels,
  syncRuleset,
  syncSettings,
} from "@/core/github.ts";
import { initLocalBaseline } from "@/core/init.ts";

function printHelp(): void {
  console.log(`Usage: standards <command> [arguments]

Commands:
  init <target>           Initialize local baseline files and configurations
  sync-labels <repo>      Sync standard GitHub labels (e.g. owner/repo)
  sync-ruleset <repo>     Sync default branch protection ruleset
  sync-settings <repo>    Sync repository settings (auto-merge, delete-branch-on-merge)
  sync <repo>             Sync all remote GitHub configurations (settings + labels + ruleset)
  sync-github <repo>      Alias for sync
  apply [target]          Apply baseline locally and sync to remote if git origin exists

Options:
  -h, --help              Show this help message
`);
}

export async function runCli(args: string[]): Promise<void> {
  const [command, target] = args;

  if (
    !command ||
    command === "-h" ||
    command === "--help" ||
    command === "help"
  ) {
    printHelp();
    return;
  }

  switch (command) {
    case "init": {
      if (!target) {
        throw new Error(
          "missing target directory. usage: standards init <target>",
        );
      }
      await initLocalBaseline(target);
      break;
    }

    case "sync-labels": {
      if (!target) {
        throw new Error(
          "missing repo. usage: standards sync-labels <owner/repo>",
        );
      }
      await syncLabels(target);
      break;
    }

    case "sync-ruleset": {
      if (!target) {
        throw new Error(
          "missing repo. usage: standards sync-ruleset <owner/repo>",
        );
      }
      await syncRuleset(target);
      break;
    }

    case "sync-settings": {
      if (!target) {
        throw new Error(
          "missing repo. usage: standards sync-settings <owner/repo>",
        );
      }
      await syncSettings(target);
      break;
    }

    case "sync":
    case "sync-github": {
      if (!target) {
        throw new Error("missing repo. usage: standards sync <owner/repo>");
      }
      await syncGitHub(target);
      break;
    }

    case "apply": {
      const targetDir = target || ".";
      await initLocalBaseline(targetDir);

      const repoSlug = await resolveRepoSlug(targetDir);
      if (repoSlug) {
        console.log(`[apply] detected remote: ${repoSlug}`);
        await syncGitHub(repoSlug);
      } else {
        console.log("[apply] no remote github repository detected");
      }
      break;
    }

    default: {
      console.error(`unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
    }
  }
}
