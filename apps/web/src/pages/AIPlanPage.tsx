import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Target,
  Clock,
  Calendar,
  Layers,
  Trash2,
  Edit2,
  Check,
  ArrowRight,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { api } from "../api";
import { StructuredPlan, PlanMilestoneItem, PlanTaskItem } from "../types";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { PriorityBadge } from "../components/Badge";

export const AIPlanPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Input State
  const [goalTitle, setGoalTitle] = useState("Prepare for Senior Full Stack Engineer Interview in 6 Weeks");
  const [category, setCategory] = useState("Career");
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [dailyHours, setDailyHours] = useState(2.0);
  const [currentSkill, setCurrentSkill] = useState("Intermediate");
  const [preferredDays, setPreferredDays] = useState("Monday,Tuesday,Wednesday,Thursday,Friday,Saturday");

  // Flow State
  const [step, setStep] = useState<"INPUT" | "GENERATING" | "PREVIEW">("INPUT");
  const [generatedPlan, setGeneratedPlan] = useState<StructuredPlan | null>(null);
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);
  const [planId, setPlanId] = useState<number | undefined>(undefined);
  const [isApproving, setIsApproving] = useState(false);

  // Edit Task Inline State
  const [editingTaskCoord, setEditingTaskCoord] = useState<{ mIdx: number; tIdx: number } | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedMinutes, setEditedMinutes] = useState(60);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("GENERATING");

    try {
      // 1. Create base goal in database
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

      const goal = await api.createGoal({
        title: goalTitle,
        category,
        deadline: deadlineDate.toISOString(),
        target_hours: Math.round(deadlineDays * dailyHours * 0.8),
        current_skill: currentSkill,
        preferred_days: preferredDays,
      });
      setCreatedGoalId(goal.id);

      // 2. Trigger AI decomposition pipeline
      const planResp = await api.generateAIPlan(goal.id, {
        goal: goalTitle,
        deadline_days: Number(deadlineDays),
        daily_available_hours: Number(dailyHours),
        current_skill: currentSkill,
        preferred_days: preferredDays,
      });

      setGeneratedPlan(planResp.structured_plan);
      setPlanId(planResp.plan_id);
      setStep("PREVIEW");
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      alert("Failed to generate plan. Please verify backend connection.");
      setStep("INPUT");
    }
  };

  const handleDeleteTask = (mIdx: number, tIdx: number) => {
    if (!generatedPlan) return;
    const newMilestones = [...generatedPlan.milestones];
    newMilestones[mIdx].tasks.splice(tIdx, 1);
    setGeneratedPlan({ ...generatedPlan, milestones: newMilestones });
  };

  const handleStartEditTask = (mIdx: number, tIdx: number, task: PlanTaskItem) => {
    setEditingTaskCoord({ mIdx, tIdx });
    setEditedTitle(task.title);
    setEditedMinutes(task.estimated_minutes);
  };

  const handleSaveEditTask = () => {
    if (!generatedPlan || !editingTaskCoord) return;
    const { mIdx, tIdx } = editingTaskCoord;
    const newMilestones = [...generatedPlan.milestones];
    newMilestones[mIdx].tasks[tIdx].title = editedTitle;
    newMilestones[mIdx].tasks[tIdx].estimated_minutes = Number(editedMinutes);
    setGeneratedPlan({ ...generatedPlan, milestones: newMilestones });
    setEditingTaskCoord(null);
  };

  const handleApprovePlan = async () => {
    if (!createdGoalId || !generatedPlan) return;
    setIsApproving(true);
    try {
      await api.approveAIPlan(createdGoalId, generatedPlan, planId);
      navigate(`/goals/${createdGoalId}`);
    } catch (err) {
      console.error("Failed to approve plan:", err);
      alert("Error saving approved roadmap.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          AI Goal Wizard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {step === "INPUT" && "Specify your goal parameters to generate a customized execution roadmap."}
          {step === "GENERATING" && "Analyzing constraints and synthesizing milestones..."}
          {step === "PREVIEW" && "Review, adjust, reorder or approve the AI-generated schedule before saving."}
        </p>
      </div>

      {step === "INPUT" && (
        <Card className="p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <Input
              label="What is your high-level goal?"
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Master React and System Design in 6 weeks"
              required
              leftIcon={<Target className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                >
                  <option value="Career">Career & Interview Prep</option>
                  <option value="Learning">Software Development & Coding</option>
                  <option value="Health">Fitness & Health</option>
                  <option value="Personal">Personal Projects</option>
                </select>
              </div>

              <Input
                label="Target Timeframe (Days)"
                type="number"
                min={7}
                max={365}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                leftIcon={<Calendar className="w-4 h-4" />}
                required
              />

              <Input
                label="Available Study Time (Hours/Day)"
                type="number"
                step="0.5"
                min={0.5}
                max={12}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                leftIcon={<Clock className="w-4 h-4" />}
                required
              />

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Current Skill Level
                </label>
                <select
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100"
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Practitioner)</option>
                  <option value="Advanced">Advanced (Senior / Deep Mastery)</option>
                </select>
              </div>
            </div>

            <Input
              label="Preferred Focus Days"
              type="text"
              value={preferredDays}
              onChange={(e) => setPreferredDays(e.target.value)}
              helperText="Comma-separated days of the week when tasks should be scheduled"
            />

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button type="submit" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Decompose with AI Agent
              </Button>
            </div>
          </form>
        </Card>
      )}

      {step === "GENERATING" && (
        <Card className="text-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 mx-auto flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Synthesizing Customized Plan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The multi-stage agent pipeline is decomposing milestones, balancing daily capacity, and assigning realistic task priorities...
          </p>
        </Card>
      )}

      {step === "PREVIEW" && generatedPlan && (
        <div className="space-y-6">
          {/* Plan Summary Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-md">
                Feasibility Rating: {generatedPlan.feasibility_score}%
              </span>
              <span className="text-xs font-medium opacity-90">
                Duration: {generatedPlan.duration_weeks} Weeks • ~{generatedPlan.total_estimated_hours} Total Hours
              </span>
            </div>
            <h2 className="text-xl font-black">{generatedPlan.goal_title}</h2>
            {generatedPlan.clarification_notes && (
              <p className="text-xs opacity-90">{generatedPlan.clarification_notes}</p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setStep("INPUT")} leftIcon={<Sliders className="w-4 h-4" />}>
              Adjust Parameters
            </Button>
            <Button
              size="md"
              isLoading={isApproving}
              onClick={handleApprovePlan}
              rightIcon={<Check className="w-4 h-4" />}
            >
              Approve & Launch Schedule
            </Button>
          </div>

          {/* Milestones & Editable Tasks Preview */}
          <div className="space-y-6">
            {generatedPlan.milestones.map((milestone, mIdx) => (
              <div key={mIdx} className="space-y-3">
                <div className="p-3.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Milestone {mIdx + 1}: {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{milestone.description}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500">~{milestone.estimated_days} days</span>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                  {milestone.tasks.map((task, tIdx) => {
                    const isEditing = editingTaskCoord?.mIdx === mIdx && editingTaskCoord?.tIdx === tIdx;

                    return (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                placeholder="Task title"
                              />
                              <Input
                                type="number"
                                label="Estimated Minutes"
                                value={editedMinutes}
                                onChange={(e) => setEditedMinutes(Number(e.target.value))}
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveEditTask}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingTaskCoord(null)}>Cancel</Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <PriorityBadge priority={task.priority} />
                                <span className="text-xs text-slate-400">
                                  {task.estimated_minutes} mins • Day +{task.scheduled_day_offset}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</h4>
                              {task.description && (
                                <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                              )}
                              {task.notes && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                                  Tip: {task.notes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditTask(mIdx, tIdx, task)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                              title="Edit Task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(mIdx, tIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Remove Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* AI Recommendations */}
          <Card className="bg-slate-50 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Agent Strategy & Guidance
            </h4>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
              {generatedPlan.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
};
