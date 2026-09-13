import React from "react";
import { Priority, TaskStatus } from "../types";

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const styles: Record<Priority, string> = {
    LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    MEDIUM: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50",
    HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50",
    CRITICAL: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50 font-semibold",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[priority] || styles.MEDIUM}`}>
      {priority}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus | string }> = ({ status }) => {
  const styles: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    IN_PROGRESS: "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200/50",
    COMPLETED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/50",
    OVERDUE: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/50",
    SKIPPED: "bg-slate-100 text-slate-500 line-through dark:bg-slate-800 dark:text-slate-500",
    ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    PENDING: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] || styles.TODO}`}>
      {status.replace("_", " ")}
    </span>
  );
};
