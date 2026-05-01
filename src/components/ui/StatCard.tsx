import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "blue" | "green" | "red" | "amber" | "purple";
  trend?: { value: number; label: string };
}

const COLORS = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   val: "text-blue-700"   },
  green:  { bg: "bg-emerald-50",icon: "bg-emerald-100 text-emerald-600", val: "text-slate-900" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100 text-red-600",     val: "text-slate-900"  },
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-600", val: "text-slate-900"  },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600",val: "text-slate-900" },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "blue", trend }: StatCardProps) {
  const c = COLORS[color];
  return (
    <div className="card flex items-center gap-3 py-3">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", c.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium">{title}</p>
        <p className={cn("text-xl font-bold leading-tight truncate", c.val)}>{value}</p>
        {subtitle && <p className="text-[11px] text-slate-400 leading-tight">{subtitle}</p>}
        {trend && (
          <div className={cn(
            "inline-flex items-center gap-1 text-xs font-medium mt-1 px-1.5 py-0.5 rounded",
            trend.value >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          )}>
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </div>
    </div>
  );
}
