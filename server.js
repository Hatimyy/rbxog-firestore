import express from "express";
import cors from "cors";
import crypto from "crypto";
import admin from "firebase-admin";

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert("./serviceAccountKey.json")
});
const db = admin.firestore();

const LOCKER_LINKS = [
  "https://locked4.com/cl/i/x6edrl",
  "https://appslocked.com/cl/i/x6edrl",
  "https://locked3.com/cl/i/5k9v46",
  "https://locked4.com/cl/i/o6w532",
  "https://appslocked.com/cl/i/mejg9m"
];

// بدء العرض
app.post("/start-offer", async (req, res) => {
  const { username, offerIndex } = req.body;
  if (!username || offerIndex === undefined) return res.status(400).json({ error: "Missing params" });

  const token = crypto.randomBytes(16).toString("hex");
  const offerUrl = `${LOCKER_LINKS[offerIndex]}?subid=${token}`;

  await db.collection("pending_offers").doc(token).set({
    username,
    offerIndex,
    status: "started",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ token, offerUrl });
});

// استلام postback
app.get("/offer-complete", async (req, res) => {
  const { subid, amount } = req.query;
  if (!subid || !amount) return res.status(400).send("Missing params");

  const docRef = db.collection("pending_offers").doc(subid);
  const docSnap = await docRef.get();
  if (!docSnap.exists) return res.status(404).send("Invalid subid");

  const username = docSnap.data().username;
  await db.collection("users").doc(username).set(
    { coins: admin.firestore.FieldValue.increment(Number(amount)) },
    { merge: true }
  );

  await docRef.update({ status: "completed" });
  res.send("OK");
});

// حالة العرض
app.get("/offer-status", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token");

  const docSnap = await db.collection("pending_offers").doc(token).get();
  if (!docSnap.exists) return res.json({ status: "unknown" });

  res.json({ status: docSnap.data().status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
