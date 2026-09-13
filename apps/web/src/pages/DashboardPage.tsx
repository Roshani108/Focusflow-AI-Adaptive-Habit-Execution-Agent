import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { api } from "../api";
import { DashboardSummary, Task } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { TaskCard } from "../components/TaskCard";
import { GoalCard } from "../components/GoalCard";
import { ProgressBar } from "../components/ProgressBar";
import { Modal } from "../components/Modal";

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanSuccessModal, setReplanSuccessModal] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      const summary = await api.getDashboard();
      setData(summary);
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await api.updateTaskStatus(task.id, "TODO");
      } else {
        await api.completeTask(task.id, task.estimated_minutes);
      }
      await loadDashboard();
    } catch (err) {
      console.error("Error toggling task status:", err);
    }
  };

  const handleTriggerReplan = async (goalId?: number) => {
    const targetGoalId = goalId || (data?.active_goals && data.active_goals[0]?.id);
    if (!targetGoalId) return;

    setIsReplanning(true);
    try {
      const result = await api.replanGoal(targetGoalId);
      setReplanSuccessModal(result.summary);
      await loadDashboard();
    } catch (err: any) {
      console.error("Failed to replan:", err);
    } finally {
      setIsReplanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Failed to load dashboard data. Please check your backend connection.</p>
        <Button onClick={loadDashboard} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Today's Focus</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data.overdue_tasks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              isLoading={isReplanning}
              onClick={() => handleTriggerReplan()}
              leftIcon={<RefreshCw className="w-4 h-4 text-amber-500" />}
            >
              Smart Replan Overdue ({data.overdue_tasks.length})
            </Button>
          )}
          <Button size="sm" onClick={() => navigate("/planner")} leftIcon={<Plus className="w-4 h-4" />}>
            New Goal
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-bold text-lg">
            {data.today_completion_percentage}%
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Progress</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {data.today_completed_count} / {data.today_total_count}{" "}
              <span className="text-xs font-normal text-slate-500">tasks</span>
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {data.current_streak_days} <span className="text-xs font-normal text-slate-500">days</span>
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Velocity Trend</p>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              {data.productivity_trend}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Goals</p>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {data.active_goals.length} <span className="text-xs font-normal text-slate-500">in flight</span>
            </h3>
          </div>
        </Card>
      </div>

      {/* Overdue Tasks Alert if any */}
      {data.overdue_tasks.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-xl mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {data.overdue_tasks.length} Overdue Task{data.overdue_tasks.length > 1 ? "s" : ""} Detected
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Tasks from previous days require attention. FocusFlow AI can redistribute them across upcoming days without exceeding your daily workload limit.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            isLoading={isReplanning}
            onClick={() => handleTriggerReplan()}
            className="whitespace-nowrap bg-amber-600 hover:bg-amber-700"
          >
            Auto Replan Now
          </Button>
        </div>
      )}

      {/* Main Grid: Today's Tasks + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Scheduled for Today</h3>
            <span className="text-xs font-semibold text-slate-400">
              {data.today_completed_count} of {data.today_total_count} Completed
            </span>
          </div>

          {data.today_tasks.length === 0 ? (
            <Card className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No tasks scheduled for today!</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You're completely caught up, or your active goals don't have tasks mapped for today.
              </p>
              <Button size="sm" onClick={() => navigate("/planner")} className="mt-4">
                Launch AI Goal Wizard
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.today_tasks.map((task) => (
                <TaskCard key={task.id} task={task} onToggleComplete={handleToggleTask} />
              ))}
            </div>
          )}

          {/* AI Recommendations */}
          <Card className="bg-gradient-to-br from-indigo-50/50 to-brand-50/50 border-brand-100 dark:from-slate-900 dark:to-indigo-950/20 dark:border-slate-800">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider">AI Agent Recommendations</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              {data.ai_recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right Column: Weekly Chart + Active Goals */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Weekly Velocity</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly_progress} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="completed_tasks" name="Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_tasks" name="Total Planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Active Goals mini-list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Goals</h3>
              <Link to="/goals" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                View All
              </Link>
            </div>
            {data.active_goals.slice(0, 2).map((goal) => (
              <GoalCard key={goal.id} goal={goal} onReplan={handleTriggerReplan} />
            ))}
          </div>
        </div>
      </div>

      {/* Replanning Success Modal */}
      <Modal
        isOpen={!!replanSuccessModal}
        onClose={() => setReplanSuccessModal(null)}
        title="Schedule Updated by AI Replanner"
      >
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-sm">
            {replanSuccessModal}
          </div>
          <p className="text-xs text-slate-500">
            The remaining tasks have been reassigned across upcoming active days while respecting your daily study limit.
          </p>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setReplanSuccessModal(null)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
