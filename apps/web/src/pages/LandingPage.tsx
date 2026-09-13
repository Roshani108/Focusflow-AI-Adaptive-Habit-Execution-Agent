import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, ArrowRight, Zap, Target, RefreshCw, BarChart3, ShieldCheck } from "lucide-react";
import { Button } from "../components/Button";

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            FocusFlow <span className="text-brand-600">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold mb-8 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Next-Generation AI Productivity & Execution Agent
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Turn high-level ambitions into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-500">
            guaranteed daily execution.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Input your complex goals. FocusFlow decomposes them into sequential milestones, optimizes your calendar schedule, tracks velocity, and autonomously replans when life gets in the way.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link to="/login?demo=true">
            <Button size="lg" className="px-8" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Launch Live Demo
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">
              Create Free Account
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Goal Decomposition</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Breaks abstract goals into structured milestones and realistic sub-tasks with calculated time estimates and dependencies.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Autonomous Replanning</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Missed yesterday's tasks? The replanning agent dynamically redistributes overdue items without exceeding your daily workload limit.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Analytics</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              True database-backed velocity tracking, completion streaks, focus minutes, and workload distribution metrics.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
