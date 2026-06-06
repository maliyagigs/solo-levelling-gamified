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
  const TOTAL_MANA_SHARES = 100000;
  const LISTING_PRICE_USD = 0.0001;
  
  // In-memory cache for the global economy state
  let cachedCirculatingMana = 0;
  let cachedCurrentManaValue = LISTING_PRICE_USD;

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
      // Simple dynamic price model: base listing price + growth factor based on scarcity/mining
      // If we want it strictly at 0.0001 but appearing dynamic, we can add small variance or keep it fixed as requested.
      // The user says "is listing 0.0001", so let's keep it around there or use a formula that starts there.
      // Formula: Price = Listing_Price * (Total_Shares / Circulating_Mana) ? No, that makes it very high if circ is low.
      // Let's stick to the requested "listing 0.0001 USD".
      cachedCurrentManaValue = LISTING_PRICE_USD;
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
      totalShares: TOTAL_MANA_SHARES,
      circulatingMana: cachedCirculatingMana,
      currentManaValue: cachedCurrentManaValue,
      marketCap: cachedCirculatingMana * cachedCurrentManaValue
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
