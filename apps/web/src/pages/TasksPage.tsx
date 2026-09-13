import React, { useState, useEffect } from "react";
import { Plus, Filter, CheckCircle2, ListTodo } from "lucide-react";
import { api } from "../api";
import { Task, TaskStatus, Priority, Goal } from "../types";
import { TaskCard } from "../components/TaskCard";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Create Task Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("MEDIUM");
  const [newEstimated, setNewEstimated] = useState(60);
  const [newGoalId, setNewGoalId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTasks = async () => {
    try {
      const params: any = {};
      if (selectedStatus !== "ALL") params.status = selectedStatus;
      if (selectedPriority !== "ALL") params.priority = selectedPriority;

      const [taskItems, goalItems] = await Promise.all([
        api.getTasks(params),
        api.getGoals(),
      ]);
      setTasks(taskItems);
      setGoals(goalItems);
      if (goalItems.length > 0 && !newGoalId) {
        setNewGoalId(goalItems[0].id);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedStatus, selectedPriority]);

  const handleToggleTask = async (task: Task) => {
    try {
      if (task.status === "COMPLETED") {
        await api.updateTaskStatus(task.id, "TODO");
      } else {
        await api.completeTask(task.id, task.estimated_minutes);
      }
      await loadTasks();
    } catch (err) {
      console.error("Failed to toggle task status:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalId) return;
    setIsSubmitting(true);

    try {
      // Find milestone
      const goalDetail = await api.getGoalDetail(newGoalId);
      const milestoneId = goalDetail.milestones && goalDetail.milestones[0]?.id;

      await api.createTask({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        estimated_minutes: Number(newEstimated),
        goal_id: newGoalId,
        milestone_id: milestoneId,
        status: "TODO",
      });

      setIsModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      await loadTasks();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses = ["ALL", "TODO", "IN_PROGRESS", "COMPLETED", "OVERDUE"];
  const priorities = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tasks & Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">Filter by execution status, priority, and update progress</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Task
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 mr-1">Priority:</span>
          {priorities.map((pr) => (
            <button
              key={pr}
              onClick={() => setSelectedPriority(pr)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPriority === pr
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="text-center py-16">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No tasks match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try selecting a different status or priority tab.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggleComplete={handleToggleTask} />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Implement Dijkstra's algorithm"
            required
          />

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Description / Notes
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Key concepts or links to practice..."
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <Input
              label="Estimated Minutes"
              type="number"
              min={15}
              max={360}
              value={newEstimated}
              onChange={(e) => setNewEstimated(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Assign to Goal
            </label>
            <select
              value={newGoalId}
              onChange={(e) => setNewGoalId(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
