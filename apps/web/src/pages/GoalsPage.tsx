import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Target, Sparkles, Filter } from "lucide-react";
import { api } from "../api";
import { Goal } from "../types";
import { GoalCard } from "../components/GoalCard";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [replanNotice, setReplanNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error("Failed to load goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleReplan = async (goalId: number) => {
    try {
      const res = await api.replanGoal(goalId);
      setReplanNotice(res.summary);
      await loadGoals();
    } catch (err) {
      console.error("Replan failed:", err);
    }
  };

  const categories = ["ALL", "Career", "Learning", "Health", "Personal"];

  const filteredGoals = goals.filter((g) => {
    if (filterCategory === "ALL") return true;
    return g.category.toLowerCase() === filterCategory.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Goals & Roadmaps</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your milestones, task decomposition, and active roadmaps</p>
        </div>
        <Button onClick={() => navigate("/planner")} leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}>
          AI Goal Wizard
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card className="text-center py-16">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No goals found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any goals in this category. Use the AI Goal Wizard to generate a full roadmap in seconds.
          </p>
          <Button onClick={() => navigate("/planner")} className="mt-4" size="sm">
            Generate First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onReplan={handleReplan} />
          ))}
        </div>
      )}

      {/* Replan Notification Modal */}
      <Modal isOpen={!!replanNotice} onClose={() => setReplanNotice(null)} title="Schedule Updated">
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm border border-emerald-200">
            {replanNotice}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setReplanNotice(null)}>OK</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
