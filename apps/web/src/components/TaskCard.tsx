import React from "react";
import { CheckCircle2, Circle, Clock, Tag } from "lucide-react";
import { Task } from "../types";
import { PriorityBadge, StatusBadge } from "./Badge";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onClick }) => {
  const isCompleted = task.status === "COMPLETED";
  const isOverdue = task.status === "OVERDUE";

  return (
    <div
      onClick={onClick}
      className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-all duration-150 ${
        isCompleted
          ? "border-slate-100 bg-slate-50/60 opacity-75 dark:border-slate-800 dark:bg-slate-900/40"
          : isOverdue
          ? "border-rose-200 bg-rose-50/30 hover:border-rose-300 dark:border-rose-900/40"
          : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(task);
        }}
        className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors"
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-brand-500" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{task.estimated_minutes}m</span>
            {task.actual_minutes > 0 && <span className="text-slate-500">({task.actual_minutes}m actual)</span>}
          </div>
        </div>

        <h4
          className={`text-sm font-semibold leading-snug ${
            isCompleted ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
        )}

        {task.tags && (
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            {task.tags.split(",").map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
