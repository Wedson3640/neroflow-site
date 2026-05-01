"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, FileText, Download, ShieldCheck,
  Settings, LogOut, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",              label: "Dashboard",      icon: LayoutDashboard },
  { href: "/nfse",          label: "NFS-e",          icon: FileText        },
  { href: "/download",      label: "Downloads",      icon: Download        },
  { href: "/certificados",  label: "Certificados",   icon: ShieldCheck     },
  { href: "/configuracoes", label: "Configurações",  icon: Settings        },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-slate-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200">
        <Image
          src="/log nero flow sem fundo.png"
          alt="Neroflow"
          width={150}
          height={48}
          className="object-contain"
          priority
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-link", active && "active")}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-xs font-medium truncate">
              {user?.full_name || user?.email || "Usuário"}
            </p>
            <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="sidebar-link w-full mt-1">
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
