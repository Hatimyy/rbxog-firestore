import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import crypto from "crypto";

// تهيئة التطبيق
const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بـ Firebase باستخدام Environment Variable
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// روابط العروض
const LOCKER_LINKS = [
  "https://locked4.com/cl/i/x6edz1",
  "https://appslocked.com/cl/i/x6edz1",
  "https://locked3.com/cl/i/58v946t",
  "https://locked4.com/cl/i/o6vs32q",
  "https://appslocked.com/cl/i/ne9j9m"
];

// بدء العرض
app.post("/start-offer", async (req, res) => {
  const { username, offerIndex } = req.body;

  if (!username || offerIndex === undefined) {
    return res.status(400).json({ error: "Missing username or offerIndex" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  const offerUrl = ${LOCKER_LINKS[offerIndex]}?subid=${token};

  await db.collection("pending_offers").doc(token).set({
    username,
    offerIndex,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ token, offerUrl });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});