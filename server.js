import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 25737);
const basePath = process.env.BASE_PATH && process.env.BASE_PATH !== "/" ? process.env.BASE_PATH : "";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safeFilePath(requestPath) {
  const pathname = decodeURIComponent(requestPath.split("?")[0]);
  const withoutBase = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const relative = withoutBase.replace(/^\/+/, "") || "index.html";
  const candidate = path.resolve(root, relative);
  return candidate.startsWith(root + path.sep) ? candidate : null;
}

async function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const body = await readFile(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] || "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  response.end(body);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = safeFilePath(request.url || "/");
    if (!filePath) {
      response.writeHead(400);
      response.end("Bad request");
      return;
    }
    try {
      const fileInfo = await stat(filePath);
      if (fileInfo.isFile()) {
        await sendFile(response, filePath);
        return;
      }
    } catch {
      const requestedPath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (path.extname(requestedPath)) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      // Browser routes use the single static entry page; hash routes never reach the server.
    }
    await sendFile(response, path.join(root, "index.html"));
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Static server error: ${error.message}`);
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`SignBridge static server listening on ${port}`);
});