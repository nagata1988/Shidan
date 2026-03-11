import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(bodyParser.json());

  // データ保存用ディレクトリの作成
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
  }

  const DIAGNOSIS_FILE = path.join(DATA_DIR, "diagnoses.json");
  const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

  // API: 診断結果の保存
  app.post("/api/diagnosis/save", (req, res) => {
    try {
      const data = req.body;
      const diagnoses = fs.existsSync(DIAGNOSIS_FILE) 
        ? JSON.parse(fs.readFileSync(DIAGNOSIS_FILE, "utf-8")) 
        : [];
      
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...data
      };
      
      diagnoses.push(newEntry);
      fs.writeFileSync(DIAGNOSIS_FILE, JSON.stringify(diagnoses, null, 2));
      
      console.log(`[Server] Diagnosis saved: ${newEntry.id}`);
      res.json({ success: true, id: newEntry.id });
    } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ error: "Failed to save diagnosis" });
    }
  });

  // API: フィードバックの保存
  app.post("/api/feedback", (req, res) => {
    try {
      const data = req.body;
      const feedbacks = fs.existsSync(FEEDBACK_FILE) 
        ? JSON.parse(fs.readFileSync(FEEDBACK_FILE, "utf-8")) 
        : [];
      
      feedbacks.push({
        timestamp: new Date().toISOString(),
        ...data
      });
      
      fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // API: 蓄積データの統計取得 (将来の分析用)
  app.get("/api/stats", (req, res) => {
    if (!fs.existsSync(DIAGNOSIS_FILE)) return res.json({ count: 0 });
    const diagnoses = JSON.parse(fs.readFileSync(DIAGNOSIS_FILE, "utf-8"));
    res.json({ count: diagnoses.length });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
