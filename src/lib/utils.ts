import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length === 14)
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (digits.length === 11)
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return cnpj;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("pt-BR");
  } catch {
    return dateStr;
  }
}

export function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "NORMAL":      return { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" };
    case "CANCELADA":   return { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500"     };
    case "SUBSTITUIDA": return { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500"   };
    case "PENDENTE":    return { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   };
    default:            return { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   };
  }
}

export function buildQueryString(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  return q.toString();
}
