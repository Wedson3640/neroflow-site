"use client";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {user?.full_name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.full_name?.split(" ")[0] || "Usuário"}
          </span>
        </div>
      </div>
    </header>
  );
}
