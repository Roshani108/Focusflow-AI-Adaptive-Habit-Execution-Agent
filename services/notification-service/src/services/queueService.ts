import Redis from "ioredis";
import { config } from "../config.js";

export interface NotificationJob {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: "TASK_REMINDER" | "OVERDUE_TASK" | "GOAL_DEADLINE" | "SCHEDULE_CHANGE" | "AI_RECOMMENDATION";
  scheduledFor?: Date;
}

class QueueService {
  private redis: Redis | null = null;
  private inMemoryQueue: NotificationJob[] = [];
  public isConnected = false;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.redis = new Redis(config.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
      });

      this.redis.connect()
        .then(() => {
          this.isConnected = true;
          console.log("[QueueService] Connected to Redis queue.");
        })
        .catch((err) => {
          this.isConnected = false;
          console.warn(`[QueueService] Redis connection refused (${err.message}). Using in-memory job queue.`);
        });
    } catch (e: any) {
      this.isConnected = false;
      console.warn(`[QueueService] Using in-memory job queue fallback (${e.message}).`);
    }
  }

  async enqueue(job: NotificationJob): Promise<void> {
    if (this.isConnected && this.redis) {
      try {
        await this.redis.rpush("focusflow:notifications:queue", JSON.stringify(job));
        return;
      } catch (e) {
        console.warn("[QueueService] Redis push failed, falling back to memory queue.");
      }
    }
    this.inMemoryQueue.push(job);
  }

  async dequeue(): Promise<NotificationJob | null> {
    if (this.isConnected && this.redis) {
      try {
        const item = await this.redis.lpop("focusflow:notifications:queue");
        if (item) return JSON.parse(item);
      } catch (e) {
        console.warn("[QueueService] Redis pop failed, checking memory queue.");
      }
    }
    return this.inMemoryQueue.shift() || null;
  }

  getQueueLength(): number {
    return this.inMemoryQueue.length;
  }
}

export const queueService = new QueueService();
