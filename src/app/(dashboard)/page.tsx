"use client";
import { useEffect, useState } from "react";
import { FileText, TrendingUp, DollarSign, XCircle, Clock } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import Topbar from "@/components/layout/Topbar";
import StatCard from "@/components/ui/StatCard";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { NFSeResumo } from "@/types";
import toast from "react-hot-toast";

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

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

interface MonthData {
  mes: string;
  notas: number;
  canceladas: number;
}

interface UltimaNota {
  id: string;
  numero: string | null;
  data_emissao: string | null;
  prestador: string | null;
  tomador: string | null;
  valor_servicos: number;
  status: string;
}

async function fetchMonthlyData(): Promise<MonthData[]> {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();

  const requests = MONTHS.slice(0, currentMonth + 1).map((mes, i) => {
    const monthNum = String(i + 1).padStart(2, "0");
    const lastDay = new Date(year, i + 1, 0).getDate();
    return api
      .get(`/nfse/resumo?data_inicio=${year}-${monthNum}-01&data_fim=${year}-${monthNum}-${lastDay}`)
      .then((r) => ({
        mes,
        notas: r.data.total ?? 0,
        canceladas: r.data.canceladas ?? 0,
      }))
      .catch(() => ({ mes, notas: 0, canceladas: 0 }));
  });

  return Promise.all(requests);
}

const STATUS_STYLE: Record<string, string> = {
  NORMAL:      "bg-emerald-100 text-emerald-700",
  CANCELADA:   "bg-red-100 text-red-700",
  SUBSTITUIDA: "bg-amber-100 text-amber-700",
  PENDENTE:    "bg-slate-100 text-slate-600",
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#94a3b8"];

export default function DashboardPage() {
  const [resumo, setResumo]             = useState<NFSeResumo | null>(null);
  const [chartData, setChartData]       = useState<MonthData[]>([]);
  const [ultimasNotas, setUltimasNotas] = useState<UltimaNota[]>([]);
  const [loading, setLoading]           = useState(true);
  const periodo = getMesAtual();

  useEffect(() => {
    Promise.all([
      api.get(`/nfse/resumo?data_inicio=${periodo.inicio}&data_fim=${periodo.fim}`),
      fetchMonthlyData(),
      api.get(`/nfse/listar?pagina=1&por_pagina=20`),
    ])
      .then(([resumoRes, monthly, notasRes]) => {
        setResumo(resumoRes.data);
        setChartData(monthly);
        setUltimasNotas(notasRes.data?.items ?? notasRes.data?.notas ?? []);
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  const pieData = [
    { name: "Normais",      value: resumo?.normais      ?? 0 },
    { name: "Substituídas", value: resumo?.substituidas ?? 0 },
    { name: "Canceladas",   value: resumo?.canceladas   ?? 0 },
  ];

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

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Linha tracejada — Notas por mês */}
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Notas por Período — {new Date().getFullYear()}
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="notas"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={{ r: 4, fill: "#3b82f6" }}
                      activeDot={{ r: 6 }}
                      name="Notas"
                    />
                    <Line
                      type="monotone"
                      dataKey="canceladas"
                      stroke="#f87171"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={{ r: 3, fill: "#f87171" }}
                      name="Canceladas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Donut — Notas por Status */}
              <div className="card flex flex-col">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Notas por Status</h3>
                <div className="flex items-center justify-between flex-1">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v: number) => v.toLocaleString("pt-BR")}
                        contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legenda manual */}
                  <div className="flex flex-col gap-3 pr-4">
                    {pieData.map((item, i) => {
                      const pct = resumo?.total
                        ? ((item.value / resumo.total) * 100).toFixed(0)
                        : "0";
                      return (
                        <div key={item.name} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-xs text-slate-600">{item.name}</span>
                          <span className="text-xs font-semibold text-slate-800 ml-auto pl-4">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Últimas notas */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-700">Últimas notas baixadas</h3>
                <span className="ml-auto text-xs text-slate-400">{ultimasNotas.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nº</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prestador</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tomador</th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Data</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ultimasNotas.map((nota) => (
                      <tr key={nota.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-xs text-slate-600">{nota.numero ?? "—"}</td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-[180px] truncate" title={nota.prestador ?? ""}>
                          {nota.prestador ?? "—"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-[160px] truncate" title={nota.tomador ?? ""}>
                          {nota.tomador ?? "—"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                          {formatCurrency(nota.valor_servicos)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 whitespace-nowrap">
                          {nota.data_emissao
                            ? new Date(nota.data_emissao).toLocaleDateString("pt-BR")
                            : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[nota.status] ?? STATUS_STYLE.PENDENTE}`}>
                            {nota.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {ultimasNotas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                          Nenhuma nota encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
