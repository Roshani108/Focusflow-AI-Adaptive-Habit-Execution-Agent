import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, CheckCircle2, Calendar, Target, Clock } from "lucide-react";
import { api } from "../api";
import { Goal, Task } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { TaskCard } from "../components/TaskCard";
import { StatusBadge } from "../components/Badge";
import { Modal } from "../components/Modal";

export const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanSummary, setReplanSummary] = useState<string | null>(null);

  const loadGoal = async () => {
    if (!id) return;
    try {
      const data = await api.getGoalDetail(Number(id));
      setGoal(data);
    } catch (err) {
      console.error("Failed to load goal detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoal();
  }, [id]);

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await api.updateTaskStatus(task.id, "TODO");
      } else {
        await api.completeTask(task.id, task.estimated_minutes);
      }
      await loadGoal();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleReplan = async () => {
    if (!goal) return;
    setIsReplanning(true);
    try {
      const res = await api.replanGoal(goal.id);
      setReplanSummary(res.summary);
      await loadGoal();
    } catch (err) {
      console.error("Replan error:", err);
    } finally {
      setIsReplanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Goal not found.</p>
        <Link to="/goals" className="mt-4 inline-block text-brand-600 font-bold">
          Back to Goals
        </Link>
      </div>
    );
  }

  const allTasks = goal.milestones ? goal.milestones.flatMap((m) => m.tasks || []) : [];
  const completedTasks = allTasks.filter((t) => t.status === "COMPLETED");
  const pct = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/goals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all Goals
        </Link>
        <Button
          size="sm"
          variant="outline"
          isLoading={isReplanning}
          onClick={handleReplan}
          leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
        >
          Smart Replan Roadmap
        </Button>
      </div>

      {/* Goal Summary Card */}
      <Card className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                {goal.category}
              </span>
              <StatusBadge status={goal.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{goal.title}</h1>
            {goal.description && <p className="text-sm text-slate-500 leading-relaxed">{goal.description}</p>}
          </div>

          <div className="w-full lg:w-72 space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <ProgressBar progress={pct} label="Roadmap Completion" />
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {completedTasks.length} / {allTasks.length} tasks
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones and Tasks Tree */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Milestones & Action Steps</h2>

        {(!goal.milestones || goal.milestones.length === 0) ? (
          <Card className="text-center py-12">
            <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No milestones yet</p>
            <p className="text-xs text-slate-500 mt-1">Use AI Planner to generate milestones for this goal.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {goal.milestones.map((milestone, mIdx) => (
              <div key={milestone.id} className="space-y-3">
                {/* Milestone Header */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                      {mIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{milestone.title}</h3>
                      {milestone.description && (
                        <p className="text-xs text-slate-500">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={milestone.status} />
                </div>

                {/* Milestone Tasks */}
                <div className="pl-6 space-y-2.5 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
                  {milestone.tasks && milestone.tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onToggleComplete={handleToggleTask} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Replan Modal */}
      <Modal isOpen={!!replanSummary} onClose={() => setReplanSummary(null)} title="Schedule Updated">
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-200">
            {replanSummary}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setReplanSummary(null)}>Got it</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
