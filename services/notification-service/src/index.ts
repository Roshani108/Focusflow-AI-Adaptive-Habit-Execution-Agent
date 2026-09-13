import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config.js";
import { scheduler } from "./scheduler.js";
import triggersRouter from "./routes/triggers.js";

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "FocusFlow Notification Service",
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Triggers & queues API
app.use("/api/triggers", triggersRouter);

// Start server
app.listen(config.port, () => {
  console.log(`[NotificationService] Listening on port ${config.port}`);
  scheduler.start();
});

export default app;
