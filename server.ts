import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Proxy Route to avoid CORS and client-side network issues
  app.get("/api/mc-status", async (req, res) => {
    const { address, type } = req.query;
    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    try {
      const type = (req.query.type as string) || 'java';
      const address = req.query.address as string;
      const apiUrl = `https://api.mcsrvstat.us/${type}/3/${encodeURIComponent(address)}`;
      
      const startTime = Date.now();
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        const latency = Date.now() - startTime;
        if (data.online) {
          return res.json({ ...data, latency });
        }
      }
      
      // Fallback for Java servers if mcsrvstat fails or returns offline
      if (type === 'java') {
        const fbStartTime = Date.now();
        const fallbackUrl = `https://mcapi.us/server/status?ip=${encodeURIComponent(address)}`;
        const fbResponse = await fetch(fallbackUrl);
        if (fbResponse.ok) {
          const fbData = await fbResponse.json();
          const fbLatency = Date.now() - fbStartTime;
          if (fbData.online) {
            // Map fallback data to a similar structure
            return res.json({
              online: true,
              ip: fbData.server.address,
              port: fbData.server.port,
              version: fbData.server.name,
              players: {
                online: fbData.players.now,
                max: fbData.players.max
              },
              motd: {
                clean: [fbData.motd]
              },
              icon: fbData.favicon,
              latency: fbLatency
            });
          }
        }
      }

      res.json({ online: false });
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Failed to fetch server status" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
