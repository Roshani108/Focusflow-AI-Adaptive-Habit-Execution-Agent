import { apiClient } from "./client";
import {
  APIResponse,
  User,
  Goal,
  Task,
  StructuredPlan,
  AIPlanResponse,
  DashboardSummary,
  AnalyticsData,
  NotificationItem,
  TaskStatus,
} from "../types";

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await apiClient.post<APIResponse<{ access_token: string; refresh_token: string }>>("/auth/login", {
      email,
      password,
    });
    return res.data.data;
  },
  register: async (payload: { email: string; password: string; full_name: string }) => {
    const res = await apiClient.post<APIResponse<{ access_token: string; refresh_token: string }>>(
      "/auth/register",
      payload
    );
    return res.data.data;
  },
  getMe: async () => {
    const res = await apiClient.get<APIResponse<User>>("/auth/me");
    return res.data.data;
  },

  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get<APIResponse<DashboardSummary>>("/dashboard");
    return res.data.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await apiClient.get<APIResponse<AnalyticsData>>("/analytics");
    return res.data.data;
  },

  // Goals
  getGoals: async () => {
    const res = await apiClient.get<APIResponse<Goal[]>>("/goals");
    return res.data.data;
  },
  getGoalDetail: async (id: number) => {
    const res = await apiClient.get<APIResponse<Goal>>(`/goals/${id}`);
    return res.data.data;
  },
  createGoal: async (payload: {
    title: string;
    description?: string;
    category: string;
    deadline: string;
    target_hours: number;
    current_skill?: string;
    preferred_days?: string;
  }) => {
    const res = await apiClient.post<APIResponse<Goal>>("/goals", payload);
    return res.data.data;
  },
  generateAIPlan: async (
    goalId: number,
    payload: {
      goal: string;
      deadline_days: number;
      daily_available_hours: number;
      current_skill: string;
      preferred_days?: string;
    }
  ) => {
    const res = await apiClient.post<APIResponse<AIPlanResponse>>(`/goals/${goalId}/generate-plan`, payload);
    return res.data.data;
  },
  approveAIPlan: async (goalId: number, plan: StructuredPlan, planId?: number) => {
    const res = await apiClient.post<APIResponse<Goal>>(`/goals/${goalId}/approve-plan`, {
      goal_id: goalId,
      plan_id: planId,
      modified_plan: plan,
    });
    return res.data.data;
  },
  replanGoal: async (goalId: number) => {
    const res = await apiClient.post<APIResponse<any>>(`/goals/${goalId}/replan`);
    return res.data.data;
  },

  // Tasks
  getTasks: async (params?: { status?: string; priority?: string; goal_id?: number }) => {
    const res = await apiClient.get<APIResponse<{ items: Task[]; meta: any }>>("/tasks", { params });
    return res.data.data.items;
  },
  createTask: async (payload: Partial<Task>) => {
    const res = await apiClient.post<APIResponse<Task>>("/tasks", payload);
    return res.data.data;
  },
  updateTaskStatus: async (taskId: number, status: TaskStatus, actual_minutes?: number) => {
    const res = await apiClient.patch<APIResponse<Task>>(`/tasks/${taskId}/status`, {
      status,
      actual_minutes,
    });
    return res.data.data;
  },
  completeTask: async (taskId: number, actual_minutes?: number) => {
    const res = await apiClient.patch<APIResponse<Task>>(`/tasks/${taskId}/complete`, null, {
      params: { actual_minutes },
    });
    return res.data.data;
  },

  // Notifications
  getNotifications: async () => {
    const res = await apiClient.get<APIResponse<NotificationItem[]>>("/notifications");
    return res.data.data;
  },
  markNotificationAsRead: async (id: number) => {
    const res = await apiClient.patch<APIResponse<NotificationItem>>(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.post<APIResponse<null>>("/notifications/mark-all-read");
    return res.data;
  },
};
