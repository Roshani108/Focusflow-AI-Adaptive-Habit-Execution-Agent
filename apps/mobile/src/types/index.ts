export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "SKIPPED";

export interface User {
  id: number;
  email: string;
  full_name: string;
  daily_capacity_hours: number;
  timezone: string;
}

export interface Task {
  id: number;
  goal_id: number;
  milestone_id: number;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  estimated_minutes: number;
  actual_minutes: number;
  scheduled_date?: string;
  tags?: string;
  notes?: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  deadline: string;
  target_hours: number;
  status: string;
  progress_percentage?: number;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
