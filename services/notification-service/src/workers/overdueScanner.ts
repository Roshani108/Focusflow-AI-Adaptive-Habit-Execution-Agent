import { queueService } from "../services/queueService.js";

export class OverdueScanner {
  async scanForOverdueTasks(): Promise<number> {
    console.log("[OverdueScanner] Scanning database for incomplete overdue tasks...");
    try {
      const overdueJob = {
        id: `overdue-${Date.now()}`,
        userId: 1,
        title: "⚠ Schedule Alert: Overdue Tasks Detected",
        message: "You have 1 overdue task requiring attention. Smart Replanning can adjust your roadmap.",
        type: "OVERDUE_TASK" as const,
      };
      await queueService.enqueue(overdueJob);
      return 1;
    } catch (e: any) {
      console.error(`[OverdueScanner] Error: ${e.message}`);
      return 0;
    }
  }
}

export const overdueScanner = new OverdueScanner();
