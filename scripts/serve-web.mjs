import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const port = process.env.PORT || "8081";

if (!existsSync(dist)) {
  console.error(`Missing ${dist}. Run "npm run build" before serve:web.`);
  process.exit(1);
}

console.log(`Serving ${dist} on 0.0.0.0:${port}`);

const child = spawn(
  process.execPath,
  [
    path.join(root, "node_modules/serve/build/main.js"),
    dist,
    "-s",
    "-l",
    `tcp://0.0.0.0:${port}`,
  ],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
