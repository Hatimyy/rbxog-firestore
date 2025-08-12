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
    "https://locked4.com/cl/i/x6edz1",
    "https://appslocked.com/cl/i/x6edz1",
    "https://locked3.com/cl/i/s8v94t6",
    "https://locked4.com/cl/i/o6v532",
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
        offerUrl,
        createdAt: new Date()
    });

    res.json({ token, offerUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});