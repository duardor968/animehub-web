import { spawn } from "node:child_process";

const apiReadyUrl = "http://127.0.0.1:8000/api/v1/health/ready";
const isWindows = process.platform === "win32";
const children = new Set();
let stopping = false;

function startWorkspaceScript(filter) {
  const child = spawn(
    isWindows ? `pnpm --filter ${filter} dev` : "pnpm",
    isWindows ? [] : ["--filter", filter, "dev"],
    {
      env: process.env,
      shell: isWindows,
      stdio: "inherit",
      windowsHide: false,
    },
  );
  children.add(child);
  child.once("exit", (code, signal) => {
    children.delete(child);
    if (stopping) return;
    console.error(
      `${filter} stopped unexpectedly (${signal ?? `exit ${code ?? 1}`}).`,
    );
    void shutdown(code ?? 1);
  });
  return child;
}

function terminate(child) {
  if (!child.pid || child.killed) return;
  if (!isWindows) {
    child.kill("SIGTERM");
    return;
  }
  const terminator = spawn(
    "taskkill",
    ["/pid", String(child.pid), "/T", "/F"],
    { stdio: "ignore", windowsHide: true },
  );
  terminator.unref();
}

async function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) terminate(child);
  setTimeout(() => process.exit(exitCode), 250).unref();
}

async function waitForApi() {
  process.stdout.write("Waiting for AnimeHub API readiness");
  while (!stopping) {
    try {
      const response = await fetch(apiReadyUrl, {
        signal: AbortSignal.timeout(1_500),
      });
      if (response.ok) {
        process.stdout.write(" ready.\n");
        return;
      }
    } catch {
      // The API is still compiling or has not bound its port yet.
    }
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

process.once("SIGINT", () => void shutdown(0));
process.once("SIGTERM", () => void shutdown(0));

startWorkspaceScript("@animehub/api");
await waitForApi();
if (!stopping) startWorkspaceScript("@animehub/web");
