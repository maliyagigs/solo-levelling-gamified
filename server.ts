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
  // Endpoint to start the Google OAuth flow or simulate redirect
  app.get("/api/auth/google", (req, res) => {
    console.log("Start Google Auth redirection request received.");
    
    // Google OAuth web client credentials
    const clientId = process.env.VITE_GOOGLE_WEB_CLIENT_ID || "86371107307-o55p2sdi664cmiq2pei39fhlt0f6l2rc.apps.googleusercontent.com";
    
    // Construct the fully dynamic callback url using our robust APP_URL resolving pattern
    let baseDomain = process.env.APP_URL;
    if (baseDomain) {
      if (baseDomain.endsWith("/")) {
        baseDomain = baseDomain.slice(0, -1);
      }
    } else {
      const host = req.get("host") || "localhost:3000";
      const xForwardedProto = req.headers["x-forwarded-proto"];
      const protocol = req.secure || xForwardedProto === "https" ? "https" : "http";
      baseDomain = `${protocol}://${host}`;
    }
    const redirectUri = `${baseDomain}/api/auth/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state: "web"
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log(`Redirecting to raw Google accounts authorizing endpoint: ${googleAuthUrl}`);
    return res.redirect(googleAuthUrl);
  });

  // This endpoint handles the post-login redirect for the web app
  app.get("/api/auth/callback", async (req, res) => {
    const { code, state } = req.query;
    console.log("Handling Google Auth Callback. Code received:", code ? "YES" : "NO", "State:", state);

    let email = "hunter.solo@monarch.system";
    let name = "Sovereign Hunter";
    let sessionToken = "mock_sovereign_session_token_" + Date.now();

    if (code) {
      try {
        const clientId = process.env.VITE_GOOGLE_WEB_CLIENT_ID || "86371107307-o55p2sdi664cmiq2pei39fhlt0f6l2rc.apps.googleusercontent.com";
        const clientSecret = process.env.GOOGLE_WEB_CLIENT_SECRET || "";
        
        let baseDomain = process.env.APP_URL;
        if (baseDomain) {
          if (baseDomain.endsWith("/")) {
            baseDomain = baseDomain.slice(0, -1);
          }
        } else {
          const host = req.get("host") || "localhost:3000";
          const xForwardedProto = req.headers["x-forwarded-proto"];
          const protocol = req.secure || xForwardedProto === "https" ? "https" : "http";
          baseDomain = `${protocol}://${host}`;
        }
        const redirectUri = `${baseDomain}/api/auth/callback`;

        // Exchange authorization code for modern Google JWT tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code: code as string,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
          })
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          const { id_token, access_token } = tokenData;
          sessionToken = id_token || access_token || sessionToken;

          // Safely decode user email/profile info from Google JWT ID token
          if (id_token) {
            try {
              const parts = id_token.split(".");
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
                if (payload.email) email = payload.email;
                if (payload.name) name = payload.name;
              }
            } catch (payloadErr) {
              console.warn("Sovereign Code Warning: Could not decode token details", payloadErr);
            }
          }
        } else {
          const errText = await tokenResponse.text();
          console.error("Sovereign Code Error: Exchanging OAuth code failed:", errText);
        }
      } catch (err: any) {
        console.error("Sovereign Network Error: Token negotiation failed", err.message);
      }
    }

    // Set high-compatibility SameSite secure cookies for partitioning resilience
    res.cookie("monarch_session_email", email, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Standard web flow: pass details so frontend can sync without server-side admin credentials constraint
    console.log(`Standard Web Auth: Redirecting back to dashboard root for user ${email}`);
    return res.redirect(`/?auth_token=${encodeURIComponent(sessionToken)}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
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
