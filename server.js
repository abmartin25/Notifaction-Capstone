const http = require("http");
const fs = require("fs");
const path = require("path");
// const express = require("express");
// const app = express();
// const {PythonShell} = require('python-shell');
const {
  saveTemplate,
  getTemplate,
  getAllTemplates,
  deleteTemplate,
} = require("./db");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      const status = err.code === "ENOENT" ? 404 : 500;
      res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(status === 404 ? "404 Not Found" : "500 Internal Server Error");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

// api routes
async function handleApi(req, res, url) {
  // GET /api/templates — list saved templates
  if (req.method === "GET" && url === "/api/templates") {
    const templates = getAllTemplates();
    return sendJson(res, 200, templates);
  }

  // POST /api/templates — save/overwrite template
  if (req.method === "POST" && url === "/api/templates") {
    try {
      const body = await readBody(req);
      if (!body.name || typeof body.name !== "string" || !body.config) {
        return sendJson(res, 400, {
          error: "name (string) and config (object) are required",
        });
      }
      const template = saveTemplate(body.name.trim(), body.config);
      return sendJson(res, 200, template);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  // Passing to PythonShell
  // if 

  // GET /api/templates/:id — load template with config
  const matchId = url.match(/^\/api\/templates\/(\d+)$/);
  if (matchId) {
    if (req.method === "GET") {
      const template = getTemplate(parseInt(matchId[1], 10));
      if (!template) return sendJson(res, 404, { error: "Template not found" });
      return sendJson(res, 200, template);
    }
    if (req.method === "DELETE") {
      const deleted = deleteTemplate(parseInt(matchId[1], 10));
      if (!deleted) return sendJson(res, 404, { error: "Template not found" });
      return sendJson(res, 200, { success: true });
    }
  }

  sendJson(res, 404, { error: "Unknown API route" });
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split("?")[0];

  if (url.startsWith("/api/")) {
    return handleApi(req, res, url);
  }

  const requestPath = url === "/" ? "/index.html" : url;
  const safePath = path.normalize(requestPath).replace(/^([.][.][/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  // Let Electron know the server is ready
  if (process.send) {
    process.send("server-ready");
  }
});
