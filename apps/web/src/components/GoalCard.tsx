import React from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, ChevronRight, Sparkles, Target } from "lucide-react";
import { Goal } from "../types";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./Badge";

interface GoalCardProps {
  goal: Goal;
  onReplan?: (goalId: number) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onReplan }) => {
  const pct = goal.progress_percentage || 0;
  const deadlineDate = new Date(goal.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold tracking-wide uppercase text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-lg">
            {goal.category}
          </span>
          <StatusBadge status={goal.status} />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{goal.title}</h3>
        {goal.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{goal.description}</p>
        )}

        <div className="mt-4">
          <ProgressBar progress={pct} label="Overall Progress" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {goal.completed_tasks || 0} / {goal.total_tasks || 0} tasks
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{deadlineDate}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {onReplan && (
          <button
            onClick={() => onReplan(goal.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Smart Replan
          </button>
        )}
        <Link
          to={`/goals/${goal.id}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-brand-600 dark:text-slate-300 transition-colors"
        >
          View Roadmap
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
