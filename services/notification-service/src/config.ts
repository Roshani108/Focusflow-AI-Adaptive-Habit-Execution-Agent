import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  fastApiUrl: process.env.FASTAPI_API_URL || "http://localhost:8000/api",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379/0",
  nodeEnv: process.env.NODE_ENV || "development",
  cronReminderIntervalMs: parseInt(process.env.CRON_REMINDER_INTERVAL_MS || "60000", 10),
  cronOverdueIntervalMs: parseInt(process.env.CRON_OVERDUE_INTERVAL_MS || "300000", 10),
};
