var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_fs = __toESM(require("fs"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  let db;
  try {
    const configRaw = import_fs.default.readFileSync(import_path.default.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
    const firebaseConfig = JSON.parse(configRaw);
    const appSetup = (0, import_app.initializeApp)(firebaseConfig);
    db = (0, import_firestore.getFirestore)(appSetup, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase initialized on server");
  } catch (err) {
    console.error("Failed to initialize Firebase on server:", err.message);
  }
  const TOTAL_MANA_SHARES = 1e7;
  const LISTING_PRICE_USD = 1e-4;
  const SIMULATED_USERS_COUNT = 5e5;
  const SIMULATED_HOLDINGS_BASE = 6245180;
  let cachedCirculatingMana = 0;
  let cachedCurrentManaValue = LISTING_PRICE_USD;
  const updateEconomyMetrics = async () => {
    if (!db) return;
    try {
      const coll = (0, import_firestore.collection)(db, "leaderboard");
      const aggregateSnapshot = await (0, import_firestore.getAggregateFromServer)(coll, {
        totalGold: (0, import_firestore.sum)("gold")
      });
      const totalGold = aggregateSnapshot.data().totalGold || 0;
      cachedCirculatingMana = totalGold;
      cachedCurrentManaValue = LISTING_PRICE_USD;
      console.log(`Economy Sync: Real Players Mana=${cachedCirculatingMana}, Price=${cachedCurrentManaValue}`);
    } catch (e) {
      console.error("Error updating economy metrics:", e.message);
    }
  };
  if (db) {
    updateEconomyMetrics();
    setInterval(updateEconomyMetrics, 1e4);
  }
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
      shareCapBalance
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
