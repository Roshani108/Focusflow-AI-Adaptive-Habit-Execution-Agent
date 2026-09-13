export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "SKIPPED";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "PAUSED";

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
  daily_capacity_hours: number;
  preferred_days: string;
  current_skill_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  goal_id: number;
  milestone_id: number;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  estimated_minutes: number;
  actual_minutes: number;
  due_date?: string;
  scheduled_date?: string;
  order_index: number;
  tags?: string;
  notes?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
  depends_on_ids?: number[];
}

export interface Milestone {
  id: number;
  goal_id: number;
  title: string;
  description?: string;
  order_index: number;
  target_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category: string;
  deadline: string;
  target_hours: number;
  status: GoalStatus;
  current_skill: string;
  preferred_days: string;
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
  total_tasks?: number;
  completed_tasks?: number;
  milestones?: Milestone[];
}

export interface PlanTaskItem {
  title: string;
  description?: string;
  priority: Priority;
  estimated_minutes: number;
  scheduled_day_offset: number;
  tags?: string;
  notes?: string;
  depends_on_task_title?: string;
}

export interface PlanMilestoneItem {
  title: string;
  description?: string;
  order_index: number;
  estimated_days: number;
  tasks: PlanTaskItem[];
}

export interface StructuredPlan {
  goal_title: string;
  duration_weeks: number;
  total_estimated_hours: number;
  feasibility_score: number;
  clarification_notes?: string;
  milestones: PlanMilestoneItem[];
  recommendations: string[];
}

export interface AIPlanResponse {
  plan_id?: number;
  goal_id?: number;
  version: number;
  status: string;
  structured_plan: StructuredPlan;
  created_at: string;
}

export interface WeeklyProgressPoint {
  day: string;
  date: string;
  completed_tasks: number;
  total_tasks: number;
  focus_minutes: number;
}

export interface DashboardSummary {
  today_tasks: Task[];
  today_completion_percentage: number;
  today_completed_count: number;
  today_total_count: number;
  current_streak_days: number;
  weekly_progress: WeeklyProgressPoint[];
  active_goals: Goal[];
  overdue_tasks: Task[];
  upcoming_deadlines: Task[];
  productivity_trend: "UPWARD" | "STEADY" | "NEEDS_ATTENTION";
  ai_recommendations: string[];
}

export interface DailyCompletionMetric {
  date: string;
  completed: number;
  missed: number;
  rate: number;
}

export interface GoalProgressMetric {
  goal_id: number;
  title: string;
  category: string;
  progress_percentage: number;
  total_tasks: number;
  completed_tasks: number;
}

export interface AnalyticsData {
  daily_completion_rate: number;
  weekly_completion_rate: number;
  average_task_completion_minutes: number;
  missed_task_frequency: number;
  productivity_streak_days: number;
  total_completed_tasks: number;
  total_focus_hours: number;
  daily_trend: DailyCompletionMetric[];
  goal_breakdown: GoalProgressMetric[];
  workload: {
    priority_distribution: Record<string, number>;
    category_distribution: Record<string, number>;
  };
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "TASK_REMINDER" | "OVERDUE_TASK" | "GOAL_DEADLINE" | "SCHEDULE_CHANGE" | "AI_RECOMMENDATION";
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}
