import { Router, Request, Response } from "express";
import { reminderWorker } from "../workers/reminderWorker.js";
import { overdueScanner } from "../workers/overdueScanner.js";
import { notificationDispatcher } from "../workers/notificationDispatcher.js";
import { queueService } from "../services/queueService.js";

const router = Router();

router.post("/process-reminders", async (req: Request, res: Response) => {
  const count = await reminderWorker.processUpcomingReminders();
  await notificationDispatcher.processQueue();
  res.json({ success: true, processed: count, message: "Reminder scan triggered." });
});

router.post("/scan-overdue", async (req: Request, res: Response) => {
  const count = await overdueScanner.scanForOverdueTasks();
  await notificationDispatcher.processQueue();
  res.json({ success: true, processed: count, message: "Overdue scan triggered." });
});

router.post("/enqueue", async (req: Request, res: Response) => {
  const { userId, title, message, type } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, error: "Missing required job parameters." });
  }

  const job = {
    id: `custom-${Date.now()}`,
    userId: Number(userId),
    title,
    message,
    type: type || "TASK_REMINDER",
  };

  await queueService.enqueue(job);
  res.json({ success: true, job, message: "Job enqueued successfully." });
});

router.get("/queue-status", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      redisConnected: queueService.isConnected,
      pendingQueueLength: queueService.getQueueLength(),
    },
  });
});

export default router;
