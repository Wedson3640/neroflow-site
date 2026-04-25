"use client";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, DollarSign, XCircle } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/ui/StatCard";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { NFSeResumo } from "@/types";
import toast from "react-hot-toast";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function generateMonthlyData() {
  return MONTHS.slice(0, new Date().getMonth() + 1).map((m) => ({
    mes: m,
    notas: Math.floor(Math.random() * 120) + 30,
    faturamento: Math.random() * 80000 + 20000,
    canceladas: Math.floor(Math.random() * 10),
  }));
}

function getMesAtual() {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  const ultimo = new Date(ano, now.getMonth() + 1, 0).getDate();
  return {
    inicio: `${ano}-${mes}-01`,
    fim: `${ano}-${mes}-${ultimo}`,
    label: `${MONTHS[now.getMonth()]}/${ano}`,
  };
}

export default function DashboardPage() {
  const [resumo, setResumo] = useState<NFSeResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData] = useState(generateMonthlyData);
  const periodo = getMesAtual();

  useEffect(() => {
    api.get(`/nfse/resumo?data_inicio=${periodo.inicio}&data_fim=${periodo.fim}`)
      .then((r) => setResumo(r.data))
      .catch(() => toast.error("Erro ao carregar resumo"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Topbar title="Dashboard" subtitle={`Mês atual — ${periodo.label}`} />
      <div className="p-6 space-y-6">

        {loading ? <PageSpinner /> : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total de Notas"
                value={resumo?.total ?? 0}
                icon={FileText}
                color="blue"
                subtitle={`${periodo.label} · todas`}
              />
              <StatCard
                title="Valor Faturado"
                value={formatCurrency(resumo?.valor_total ?? 0)}
                icon={DollarSign}
                color="green"
                subtitle={`${periodo.label} · normais`}
              />
              <StatCard
                title="ISS Total (5%)"
                value={formatCurrency((resumo?.valor_total ?? 0) * 0.05)}
                icon={TrendingUp}
                color="purple"
                subtitle={`${periodo.label} · estimativa`}
              />
              <StatCard
                title="Canceladas"
                value={resumo?.canceladas ?? 0}
                icon={XCircle}
                color="red"
                subtitle={`${periodo.label} · ${resumo?.substituidas ?? 0} substituídas`}
              />
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Normais",      value: resumo?.normais ?? 0,      color: "bg-emerald-500", pct: resumo?.total ? ((resumo.normais / resumo.total) * 100).toFixed(1) : "0" },
                { label: "Canceladas",   value: resumo?.canceladas ?? 0,   color: "bg-red-500",     pct: resumo?.total ? ((resumo.canceladas / resumo.total) * 100).toFixed(1) : "0" },
                { label: "Substituídas", value: resumo?.substituidas ?? 0, color: "bg-amber-500",   pct: resumo?.total ? ((resumo.substituidas / resumo.total) * 100).toFixed(1) : "0" },
              ].map((s) => (
                <div key={s.label} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">{s.label}</span>
                    <span className="text-sm font-semibold text-slate-500">{s.pct}%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-3">{s.value.toLocaleString("pt-BR")}</div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`${s.color} h-1.5 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Notas por mês</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="notas" fill="#3b82f6" name="Emitidas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="canceladas" fill="#f87171" name="Canceladas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Faturamento mensal</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="faturamento" stroke="#3b82f6" strokeWidth={2} fill="url(#gradFat)" name="Faturamento" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
