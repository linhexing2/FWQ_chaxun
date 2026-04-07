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
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.37 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.37'
      };

      // 1. Try mcstatus.io (Very reliable and modern)
      try {
        const msStartTime = Date.now();
        const msUrl = `https://api.mcstatus.io/v2/status/${type}/${encodeURIComponent(address)}`;
        const msResponse = await fetch(msUrl, { headers });
        if (msResponse.ok) {
          const msData = await msResponse.json();
          const msLatency = Date.now() - msStartTime;
          if (msData.online) {
            return res.json({
              online: true,
              ip: msData.host,
              port: msData.port,
              version: msData.version?.name_clean || msData.version?.name,
              players: {
                online: msData.players.online,
                max: msData.players.max,
                list: msData.players.list?.map((p: any) => p.name_clean)
              },
              motd: {
                clean: msData.motd?.clean?.split('\n') || []
              },
              icon: msData.icon,
              latency: msLatency
            });
          }
        }
      } catch (e) {
        console.error("mcstatus.io error:", e);
      }

      // 2. Try mcsrvstat.us
      try {
        const apiUrl = `https://api.mcsrvstat.us/${type}/3/${encodeURIComponent(address)}`;
        const startTime = Date.now();
        const response = await fetch(apiUrl, { headers });
        if (response.ok) {
          const data = await response.json();
          const latency = Date.now() - startTime;
          if (data.online) {
            return res.json({ ...data, latency });
          }
        }
      } catch (e) {
        console.error("mcsrvstat error:", e);
      }
      
      // Fallback for Java servers
      if (type === 'java') {
        // 3. Try Minetools API
        try {
          const mtStartTime = Date.now();
          const mtUrl = `https://api.minetools.eu/ping/${encodeURIComponent(address)}`;
          const mtResponse = await fetch(mtUrl, { headers });
          if (mtResponse.ok) {
            const mtData = await mtResponse.json();
            const mtLatency = Date.now() - mtStartTime;
            if (!mtData.error) {
              return res.json({
                online: true,
                ip: address,
                port: 25565,
                version: mtData.version.name,
                players: {
                  online: mtData.players.online,
                  max: mtData.players.max
                },
                motd: {
                  clean: [mtData.description.replace(/§[0-9a-fk-or]/g, '')]
                },
                icon: mtData.favicon,
                latency: mtLatency
              });
            }
          }
        } catch (e) {
          console.error("Minetools fallback error:", e);
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
