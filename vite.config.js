import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import robloxBackend, { resolveSessionUser } from "./server/index.js";
import { attachChatServer } from "./server/chat.js";

function setupBackend(httpServer, backendEnv) {
  const chatServer = attachChatServer(httpServer, {
    verifySession: (token) => resolveSessionUser(token, backendEnv),
    env: backendEnv,
  });
  backendEnv.CHAT_ANNOUNCE = chatServer.announceUserTip;
}

function apiMiddleware(backendEnv) {
  return async (request, response, next) => {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`,
    );
    if (!requestUrl.pathname.startsWith("/api/")) return next();

    try {
      const requestBody = await new Promise((resolve, reject) => {
        if (request.method === "GET" || request.method === "HEAD") {
          resolve(undefined);
          return;
        }
        const chunks = [];
        request.on("data", (chunk) => chunks.push(chunk));
        request.on("end", () => resolve(Buffer.concat(chunks)));
        request.on("error", reject);
      });
      const backendResponse = await robloxBackend.fetch(
        new Request(requestUrl, {
          method: request.method,
          headers: request.headers,
          body: requestBody,
        }),
        backendEnv,
      );
      response.statusCode = backendResponse.status;
      backendResponse.headers.forEach((value, name) => {
        response.setHeader(name, value);
      });
      response.end(Buffer.from(await backendResponse.arrayBuffer()));
    } catch {
      response.statusCode = 500;
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ error: "The server could not complete the request." }));
    }
  };
}

function localBackend(backendEnv) {
  return {
    name: "local-backend",
    configureServer(devServer) {
      setupBackend(devServer.httpServer, backendEnv);
      devServer.middlewares.use(apiMiddleware(backendEnv));
    },
    configurePreviewServer(previewServer) {
      setupBackend(previewServer.httpServer, backendEnv);
      previewServer.middlewares.use(apiMiddleware(backendEnv));
    },
  };
}

export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "");
  const backendEnv = {
    MM2WILD_USER_SECRET: loadedEnv.MM2WILD_USER_SECRET,
    SUPABASE_URL: loadedEnv.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: loadedEnv.SUPABASE_SERVICE_ROLE_KEY,
    EOS_RPC_URL: loadedEnv.EOS_RPC_URL,
    EOS_BLOCKS_AHEAD: loadedEnv.EOS_BLOCKS_AHEAD,
  };

  return {
    plugins: [react(), tailwindcss(), localBackend(backendEnv)],
    define: {
      "import.meta.env.CLOUDFLARED_TURNSTILE_SITE_KEY": JSON.stringify(
        loadedEnv.CLOUDFLARED_TURNSTILE_SITE_KEY || "",
      ),
    },
    server: {
      allowedHosts: ["mm2wild-v1-02.onrender.com", "localhost"],
      host: "0.0.0.0",
    },
    preview: {
      allowedHosts: ["mm2wild-v1-02.onrender.com", "localhost"],
      host: "0.0.0.0",
      port: 10000,
      strictPort: true,
    },
  };
});