import fs from "node:fs";
import type http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, ViteDevServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function serveGalleryFiles() {
  return {
    name: "serve-gallery-files",
    configureServer(server: ViteDevServer) {
      const publicRoot = path.resolve(__dirname, "../public");
      server.middlewares.use(
        (req: http.IncomingMessage, res: http.ServerResponse, next: Connect.NextFunction) => {
          if (req.url?.startsWith("/gallery/")) {
            let pathname: string;
            try {
              pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
            } catch {
              res.statusCode = 400;
              res.end("Bad request");
              return;
            }

            const filePath = path.resolve(publicRoot, `.${pathname}`);
            if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
              res.statusCode = 403;
              res.end("Forbidden");
              return;
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                ".png": "image/png",
                ".gif": "image/gif",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".webp": "image/webp",
                ".svg": "image/svg+xml",
                ".json": "application/json",
              };

              const contentType = mimeTypes[ext] || "application/octet-stream";
              res.setHeader("Content-Type", contentType);
              res.setHeader("Cache-Control", "public, max-age=31536000");

              const fileStream = fs.createReadStream(filePath);
              fileStream.pipe(res);
              return;
            }
          }
          next();
        },
      );
    },
  };
}
