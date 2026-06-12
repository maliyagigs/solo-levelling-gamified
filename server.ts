import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, getAggregateFromServer, sum } from "firebase/firestore";

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
  const TOTAL_MANA_SHARES = 10000000; // 10 Million Share Cap
  const LISTING_PRICE_USD = 0.0001;
  const SIMULATED_USERS_COUNT = 500000;
  const SIMULATED_HOLDINGS_BASE = 6245180; // Passive users distribution
  
  // In-memory cache for the global economy state
  let cachedCirculatingMana = 0;
  let cachedCurrentManaValue = LISTING_PRICE_USD;

  // Background worker to sync circulating supply from leaderboard
  const updateEconomyMetrics = async () => {
    if (!db) return;
    try {
      const coll = collection(db, "leaderboard");
      const aggregateSnapshot = await getAggregateFromServer(coll, {
        totalGold: sum('gold')
      });
      const totalGold = aggregateSnapshot.data().totalGold || 0;
      
      cachedCirculatingMana = totalGold;
      cachedCurrentManaValue = LISTING_PRICE_USD;
      console.log(`Economy Sync: Real Players Mana=${cachedCirculatingMana}, Price=${cachedCurrentManaValue}`);
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
    const totalCirculating = SIMULATED_HOLDINGS_BASE + cachedCirculatingMana;
    const shareCapBalance = Math.max(0, TOTAL_MANA_SHARES - totalCirculating);
    res.json({
      totalShares: TOTAL_MANA_SHARES,
      circulatingMana: totalCirculating,
      realUsersManaSum: cachedCirculatingMana,
      simulatedUsers: SIMULATED_USERS_COUNT,
      currentManaValue: cachedCurrentManaValue,
      marketCap: totalCirculating * cachedCurrentManaValue,
      shareCapBalance: shareCapBalance
    });
  });

  // --- Auth & Deep Linking ---
  // This endpoint handles the post-login redirect for mobile apps vs web
  app.get("/api/auth/callback", (req, res) => {
    const sessionToken = req.query.token || "mock_session_token_xyz";
    const userAgent = req.headers["user-agent"] || "";
    
    // Check if the request is coming from the mobile app (Capacitor/WebView)
    const isMobileAppRequest = req.query.platform === "mobile" || userAgent.includes("Capacitor") || userAgent.includes("MobileAuthSovereign");

    if (isMobileAppRequest) {
      // Send the user to the custom schema registry built for the mobile app
      console.log(`Deep Linking: Redirecting mobile user with token to monarch://auth-callback`);
      return res.redirect(`monarch://auth-callback?token=${sessionToken}`);
    } else {
      // Standard web flow
      console.log(`Standard Web Auth: Redirecting to dashboard`);
      return res.redirect('/');
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
