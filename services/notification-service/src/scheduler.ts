import { config } from "./config.js";
import { reminderWorker } from "./workers/reminderWorker.js";
import { overdueScanner } from "./workers/overdueScanner.js";
import { notificationDispatcher } from "./workers/notificationDispatcher.js";

export class BackgroundScheduler {
  private reminderTimer: NodeJS.Timeout | null = null;
  private overdueTimer: NodeJS.Timeout | null = null;
  private dispatchTimer: NodeJS.Timeout | null = null;

  start() {
    console.log("[Scheduler] Starting background cron timers...");

    // 1. Check reminders every 60s
    this.reminderTimer = setInterval(async () => {
      await reminderWorker.processUpcomingReminders();
    }, config.cronReminderIntervalMs);

    // 2. Scan overdue tasks every 5 minutes
    this.overdueTimer = setInterval(async () => {
      await overdueScanner.scanForOverdueTasks();
    }, config.cronOverdueIntervalMs);

    // 3. Dispatch queue every 15s
    this.dispatchTimer = setInterval(async () => {
      await notificationDispatcher.processQueue();
    }, 15000);
  }

  stop() {
    if (this.reminderTimer) clearInterval(this.reminderTimer);
    if (this.overdueTimer) clearInterval(this.overdueTimer);
    if (this.dispatchTimer) clearInterval(this.dispatchTimer);
    console.log("[Scheduler] Background timers stopped.");
  }
}

export const scheduler = new BackgroundScheduler();
