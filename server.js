import express from "express";
import cors from "cors";
import crypto from "crypto";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK باستخدام المتغير البيئي بدل الملف
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT))
});

const db = admin.firestore();

const LOCKER_LINKS = [
  "https://locked4.com/cl/i/x6e64r",
  "https://appslocked.com/cl/i/x6e64r",
  "https://locked3.com/cl/i/sf89d4c",
  "https://locked4.com/cl/i/o6v589m",
  "https://appslocked.com/cl/i/ne9n9m"
];

// بدء العرض
app.post("/start-offer", async (req, res) => {
  const { username, offerIndex } = req.body;
  
  if (!username || offerIndex === undefined) {
    return res.status(400).json({ error: "Missing username or offerIndex" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const offerUrl = ${LOCKER_LINKS[offerIndex]}?subid=${token};

  // حفظ في قاعدة البيانات
  await db.collection("offers").doc(token).set({
    username,
    offerIndex,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ offerUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});