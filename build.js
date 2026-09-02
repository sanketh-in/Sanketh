import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "dist", "public");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "index.html"), path.join(output, "index.html"));
await cp(path.join(root, "css"), path.join(output, "css"), { recursive: true });
await cp(path.join(root, "js"), path.join(output, "js"), { recursive: true });
await cp(path.join(root, "signs"), path.join(output, "signs"), { recursive: true });
await cp(path.join(root, "favicon.svg"), path.join(output, "favicon.svg"));
await cp(path.join(root, "public"), output, { recursive: true });
console.log(`Copied static site to ${path.relative(root, output)}`);