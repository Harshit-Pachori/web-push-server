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
  res.json({ message: "Server is running..." });
});

app.post("/api/send-notification", (req, res) => {
  const { subscription, title, message } = req.body;
  if (!subscription) {
    return NextResponse.json(
      { error: "Notification subscription not found." },
      { status: 400 }
    );
  }
  console.log("before sendnotification");

  const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };
  console.log({ vapidKeys });

  webpush.setVapidDetails(
    "mailto:test@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
  console.log({ webpush });

  const notificationPayload = {
    title,
    body: message,
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: "https://example.com",
    },
    sound: "default",
    vibration: [200, 100, 200],
  };

  console.log({ subscription, notificationPayload });

  try {
    webpush
      .sendNotification(subscription, JSON.stringify(notificationPayload))
      .then(() => {
        console.log("after sendnotification");
        res.status(200).json({ message: "Notification sent successfully." });
      })
      .catch((err) => {
        console.error("Error sending notification", err);
        res.sendStatus(500);
      });
  } catch (error) {
    console.error("Error sending notification", err);
    res.sendStatus(500);
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
