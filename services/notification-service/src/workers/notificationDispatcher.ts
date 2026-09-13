import { queueService, NotificationJob } from "../services/queueService.js";

export class NotificationDispatcher {
  private isProcessing = false;

  async processQueue(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;
    let processedCount = 0;

    try {
      let job: NotificationJob | null = await queueService.dequeue();
      while (job) {
        await this.dispatch(job);
        processedCount++;
        job = await queueService.dequeue();
      }
    } catch (err: any) {
      console.error(`[NotificationDispatcher] Error processing queue: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }

    return processedCount;
  }

  async dispatch(job: NotificationJob): Promise<void> {
    const timestamp = new Date().toISOString();
    console.log(
      `[DISPATCH] [${timestamp}] User #${job.userId} | Type: ${job.type} | Title: "${job.title}" | Body: "${job.message}"`
    );
    // In production, integrate APNs / FCM push notification sdk or SendGrid / Resend email client here
  }
}

export const notificationDispatcher = new NotificationDispatcher();
