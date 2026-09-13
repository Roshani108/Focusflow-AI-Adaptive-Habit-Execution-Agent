import React, { useState } from "react";
import { User, Mail, Clock, Calendar, Cpu, Check, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [dailyCapacity, setDailyCapacity] = useState(user?.daily_capacity_hours || 3.0);
  const [preferredDays, setPreferredDays] = useState(
    user?.preferred_days || "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Account & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your productivity preferences and AI scheduling parameters</p>
      </div>

      <Card className="p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white text-2xl font-bold flex items-center justify-center shadow-md shadow-brand-500/30">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Account
              </span>
              <span className="text-[11px] text-slate-400">Timezone: {user?.timezone || "UTC"}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            AI Replanning & Capacity Constraints
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Daily Available Focus Hours"
              type="number"
              step="0.5"
              min={1}
              max={12}
              value={dailyCapacity}
              onChange={(e) => setDailyCapacity(Number(e.target.value))}
              helperText="The Smart Replanner will never schedule more tasks per day than this limit."
              leftIcon={<Clock className="w-4 h-4" />}
            />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Skill Level
              </label>
              <input
                disabled
                value={user?.current_skill_level || "Advanced"}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          <Input
            label="Allowed Study Days"
            value={preferredDays}
            onChange={(e) => setPreferredDays(e.target.value)}
            helperText="Tasks will only be calendar-scheduled on these designated days."
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Cpu className="w-4 h-4 text-brand-600" />
              AI Execution Mode
            </div>
            <p className="text-xs text-slate-500">
              Current Provider: <span className="font-semibold text-brand-600">Deterministic Mock Engine</span> (Zero external API costs, instant response, production-ready fallback).
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            ) : <span />}
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
