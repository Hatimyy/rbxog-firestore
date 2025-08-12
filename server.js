import express from "express";
import cors from "cors";
import crypto from "crypto";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// تهيئة Firebase باستخدام متغير البيئة
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT))
});

const db = admin.firestore();

const LOCKER_LINKS = [
  "https://locked4.com/cl/i/x6e64r",
  "https://appslocked.com/cl/i/x6e64r",
  "https://locked3.com/cl/i/sf89v4c",
  "https://locked4.com/cl/i/a6v5682",
  "https://appslocked.com/cl/i/ne9n9m"
];

// نقطة البداية
app.post("/start-offer", async (req, res) => {
  const { username, offerIndex } = req.body;
  if (!username || offerIndex === undefined) {
    return res.status(400).json({ error: "Missing username or offerIndex" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const offerUrl = `${LOCKER_LINKS[offerIndex]}?subid=${token}`;

  await db.collection("offers").add({
    username,
    offerIndex,
    token,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ offerUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
