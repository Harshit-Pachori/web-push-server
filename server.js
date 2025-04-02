import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import webpush from "web-push";

dotenv.config({
  path: "./.env",
});
const HOST = process.env.HOST;
const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  console.log("hii there");

  res.json({ message: "Server is running..." });
});

app.post("/api/send-notification", (req, res) => {
  const { subscription, notificationPayload } = req.body;
  console.log({ subscription, notificationPayload });

  if (!subscription) {
    return NextResponse.json(
      { error: "Notification subscription not found." },
      { status: 400 }
    );
  }

  const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };

  webpush.setVapidDetails(
    "mailto:test@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  try {
    webpush
      .sendNotification(subscription, JSON.stringify(notificationPayload))
      .then(() => {
        res.status(200).json({ message: "Notification sent successfully." });
      })
      .catch((error) => {
        res.status(500).json({ error: error?.message });
      });
  } catch (error) {
    res.status(500).json({ error: error?.message });
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    statusCode: err.statusCode || 500,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    success: false,
  });
});

app.listen(PORT, () => {
  console.log(`Server is up and running on ${HOST}:${PORT}`);
});
