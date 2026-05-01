import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for simulation state (threshold, metrics)
  let detectionThreshold = 0.5;
  let metrics = {
    precision: 0.88,
    recall: 0.76,
    f1: 0.81,
    pr_auc: 0.92
  };

  // API Routes
  app.get("/api/config", (req, res) => {
    res.json({ threshold: detectionThreshold, metrics });
  });

  app.post("/api/config", (req, res) => {
    const { threshold } = req.body;
    if (typeof threshold === "number") {
      detectionThreshold = threshold;
      // Simulate changing metrics based on threshold
      metrics.recall = Math.max(0.1, 0.95 - threshold * 0.4);
      metrics.precision = Math.min(0.99, 0.5 + threshold * 0.5);
      res.json({ success: true, threshold: detectionThreshold, metrics });
    } else {
      res.status(400).json({ error: "Invalid threshold" });
    }
  });

  app.get("/api/transactions/stream", (req, res) => {
    // Generate 5 random transactions
    const txs = Array.from({ length: 5 }).map(() => generateTx(detectionThreshold));
    res.json(txs);
  });

  app.post("/api/score", (req, res) => {
    const { tx } = req.body;
    const score = calculateScore(tx);
    const decision = score >= detectionThreshold ? "FRAUD" : "LEGIT";
    res.json({ tx, score, decision });
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

// Logic helpers
function generateTx(threshold: number) {
  const isActuallyFraud = Math.random() < 0.05; // 5% base fraud rate
  const amount = isActuallyFraud ? 500 + Math.random() * 5000 : 10 + Math.random() * 500;
  
  // Scoring logic (simulated model)
  let score = 0;
  if (isActuallyFraud) {
    score = 0.6 + Math.random() * 0.4; // Usually high
  } else {
    score = Math.random() * 0.4; // Usually low
    // 2% chance of "Suspicious" legit transaction
    if (Math.random() < 0.02) score = 0.5 + Math.random() * 0.2;
  }

  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    amount: parseFloat(amount.toFixed(2)),
    merchant: ["Amazon", "Steam", "Apple", "Uber", "CryptoEx", "Unknown Shop"][Math.floor(Math.random() * 6)],
    location: ["New York", "London", "Moscow", "Mumbai", "Tokyo", "Berlin"][Math.floor(Math.random() * 6)],
    score: parseFloat(score.toFixed(3)),
    decision: score >= threshold ? "FRAUD" : "LEGIT",
    actual: isActuallyFraud ? "FRAUD" : "LEGIT"
  };
}

function calculateScore(tx: any) {
  // Mock ML scoring
  let baseScore = 0.1;
  if (tx.amount > 1000) baseScore += 0.4;
  if (tx.is_international) baseScore += 0.2;
  if (tx.is_night) baseScore += 0.15;
  return Math.min(0.99, baseScore + Math.random() * 0.2);
}

startServer();
