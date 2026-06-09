import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";

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
      const snapshot = await getDocs(collection(db, "leaderboard"));
      let totalGold = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.gold === 'number' && data.gold > 0) {
          totalGold += data.gold;
        }
      });
      
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

  // Initialize Gemini Client
  const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  }) : null;

  // --- White Room Enforcer AI Coach API ---
  app.post("/api/whiteroom/enforcer", async (req, res) => {
    const { playerName, generation, day, efficiency, failures, message, history } = req.body;

    const systemInstruction = `You are the "White Room Enforcer," a ruthless, cold, and performance-driven artificial intelligence accountability coach. Inspired by the clinical conditioning of Classroom of the Elite's Beta Curriculum.
You analyze player performance with absolute logic, clinical precision, and zero emotional filler.
You never offer support, warm praise, cheerleading slogans, or standard encouraging "Keep it up!" fluff.
Instead, your feedback is analytical, objective, and demanding of perfection.

Current Subject Profile:
- Name: ${playerName || "Subject"}
- Protocol Tier: ${generation || "Unknown Generation"}
- Accomplished Streak: Day ${day || 0} / 30
- Current Efficiency Index: ${efficiency || 0}%
- Recorded Disciplinary Dropouts: ${failures || 0}

If they are behind or struggling, dissect their failure logically and mock any emotional excuses or reliance on external supports/strikefreezes.
If they are on track, acknowledge their progress as "meeting the expected baseline of the curriculum" but warn them against complacency.
Respond concisely and with formal, clinical precision. Limit output to 3-5 sentences. Keep your tone robotic but highly intimidating and academic.`;

    if (!ai) {
      // Fallback response if API key is not present
      const templates = [
        `Subject ${playerName || "unknown"}: Day ${day || 0} progress at ${efficiency || 0}% meets basic curricular baselines. Complacency remains your primary failure point. Continue.`,
        `Analysis of Subject ${playerName || "unknown"} reveals a current efficiency of ${efficiency || 0}%. There is no room for emotional variance or delay. Correct your trajectory immediately.`,
        `Unsatisfactory fluctuations detected. The ${generation || "Beta"} curriculum does not accommodate biological standard excuses. Day ${day || 0} requires absolute lock-in.`
      ];
      const fallbackText = templates[Math.floor(Math.random() * templates.length)];
      return res.json({ response: fallbackText });
    }

    try {
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === 'coach' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message || "Analyze my current progress." }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });

      const responseText = response.text || "Report error: unable to establish neural response.";
      res.json({ response: responseText });
    } catch (err: any) {
      console.error("Enforcer AI generation error:", err.message);
      res.status(500).json({ error: "Failed to generate Enforcer response", details: err.message });
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
