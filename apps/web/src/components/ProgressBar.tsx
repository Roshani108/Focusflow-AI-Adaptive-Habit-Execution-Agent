import React from "react";

export const ProgressBar: React.FC<{
  progress: number;
  label?: string;
  showPercentage?: boolean;
  colorClass?: string;
}> = ({ progress, label, showPercentage = true, colorClass = "bg-brand-600" }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="w-full flex flex-col gap-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          {label && <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showPercentage && <span className="font-bold">{clamped}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
