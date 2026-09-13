import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Plus, Sparkles, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC<{ title?: string }> = ({ title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900/80 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </Link>

        <Button
          onClick={() => navigate("/planner")}
          size="sm"
          leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
        >
          AI Goal Wizard
        </Button>
      </div>
    </header>
  );
};
