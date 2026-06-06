import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Firebase (server-side client SDK)
  let db: any;
  try {
    const configRaw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const firebaseConfig = JSON.parse(configRaw);
    const appSetup = initializeApp(firebaseConfig);
    db = getFirestore(appSetup, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized on server");
  } catch (err: any) {
    console.error("Failed to initialize Firebase on server:", err.message);
  }

  // --- Economy System API ---
  const MARKET_CAP_LIMIT = 100000;
  
  // In-memory cache for the global economy state
  let cachedCirculatingMana = 0;
  let cachedCurrentManaValue = MARKET_CAP_LIMIT;

  // Background worker to sync circulating supply from leaderboard
  const updateEconomyMetrics = async () => {
    if (!db) return;
    try {
      const snapshot = await getDocs(collection(db, "leaderboard"));
      let totalGold = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.gold === 'number' && data.gold > 0) {
          totalGold += data.gold;
        }
      });
      
      cachedCirculatingMana = totalGold;
      cachedCurrentManaValue = totalGold > 0 ? (MARKET_CAP_LIMIT / totalGold) : MARKET_CAP_LIMIT;
      console.log(`Economy Sync: Circulating Mana=${cachedCirculatingMana}, Price=${cachedCurrentManaValue}`);
    } catch (e: any) {
      console.error("Error updating economy metrics:", e.message);
    }
  };

  // Run immediately and then every 10 seconds (keep it responsive for demo)
  if (db) {
    updateEconomyMetrics();
    setInterval(updateEconomyMetrics, 10000);
  }

  // Client reads this directly
  app.get("/api/economy/state", (req, res) => {
    res.json({
      marketCap: MARKET_CAP_LIMIT,
      circulatingMana: cachedCirculatingMana,
      currentManaValue: cachedCurrentManaValue
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
