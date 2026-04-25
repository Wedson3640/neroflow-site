"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, Eye, Download, ChevronUp, ChevronDown } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCurrency, formatDate, formatCNPJ } from "@/lib/utils";
import { NFSeListResponse } from "@/types";
import toast from "react-hot-toast";

type Aba = "todas" | "emitidas" | "recebidas" | "canceladas";

const ABAS: { key: Aba; label: string }[] = [
  { key: "todas",      label: "Todas" },
  { key: "emitidas",   label: "Emitidas" },
  { key: "recebidas",  label: "Recebidas" },
  { key: "canceladas", label: "Canceladas" },
];

export default function NFSePage() {
  const router = useRouter();
  const [data, setData]       = useState<NFSeListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [aba, setAba]         = useState<Aba>("todas");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState("data_emissao");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("desc");

  const [form, setForm] = useState({
    filtro_status: "",
    cnpj_prestador: "",
    data_inicio: "",
    data_fim: "",
  });

  const fetchData = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), page_size: "50" });
      if (form.cnpj_prestador) params.set("cnpj_prestador", form.cnpj_prestador);
      if (form.data_inicio)    params.set("data_inicio",    form.data_inicio);
      if (form.data_fim)       params.set("data_fim",       form.data_fim);

      // Aba define status ou tipo
      if (aba === "canceladas") {
        params.set("filtro_status", "CANCELADA");
      } else if (form.filtro_status) {
        params.set("filtro_status", form.filtro_status);
      }
      if (aba === "emitidas")  params.set("tipo", "emitida");
      if (aba === "recebidas") params.set("tipo", "recebida");

      const res = await api.get(`/nfse/listar?${params}`);
      setData(res.data);
      setPage(p);
      setSelected(new Set());
    } catch {
      toast.error("Erro ao carregar notas");
    } finally {
      setLoading(false);
    }
  }, [form, aba, page]);

  useEffect(() => { fetchData(1); }, [aba]);

  function applyFilters() { fetchData(1); }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!data) return;
    setSelected(selected.size === data.items.length ? new Set() : new Set(data.items.map((n) => n.id)));
  }

  function handleSort(field: string) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field
      ? sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3 opacity-30" />;

  async function downloadXml(id: string, numero: string) {
    try {
      const res = await api.get(`/nfse/${id}`);
      const xml  = res.data?.json_raw?.xml || "";
      const blob = new Blob([xml], { type: "application/xml" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `nfse_${numero || id}.xml`;
      a.click(); URL.revokeObjectURL(url);
    } catch {
      toast.error("Erro ao baixar XML");
    }
  }

  return (
    <div>
      <Topbar title="NFS-e" subtitle={data ? `${data.total} notas encontradas` : undefined} />
      <div className="p-6 space-y-4">

        {/* Tabs de tipo */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {ABAS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAba(a.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                aba === a.key
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="CNPJ do prestador"
              className="input-field"
              value={form.cnpj_prestador}
              onChange={(e) => setForm((f) => ({ ...f, cnpj_prestador: e.target.value.replace(/\D/g, "") }))}
            />
            <select
              className="input-field"
              value={form.filtro_status}
              disabled={aba === "canceladas"}
              onChange={(e) => setForm((f) => ({ ...f, filtro_status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="NORMAL">Normal</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="SUBSTITUIDA">Substituída</option>
              <option value="PENDENTE">Pendente</option>
            </select>
            <input type="date" className="input-field" value={form.data_inicio}
              onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value }))} />
            <input type="date" className="input-field" value={form.data_fim}
              onChange={(e) => setForm((f) => ({ ...f, data_fim: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={applyFilters} className="btn-primary">
              <Search className="w-4 h-4" /> Filtrar
            </button>
            <button
              onClick={() => {
                setForm({ filtro_status: "", cnpj_prestador: "", data_inicio: "", data_fim: "" });
                setAba("todas");
              }}
              className="btn-secondary"
            >
              Limpar
            </button>
            <button onClick={() => fetchData(1)} className="btn-secondary ml-auto">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div className="card p-0 overflow-hidden">
          {loading ? <PageSpinner /> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="table-th w-10">
                        <input type="checkbox" className="rounded"
                          checked={selected.size === (data?.items.length ?? 0) && selected.size > 0}
                          onChange={toggleAll} />
                      </th>
                      {[
                        { key: "numero",          label: "Nº" },
                        { key: "data_emissao",    label: "Emissão" },
                        { key: "razao_prestador", label: "Prestador" },
                        { key: "razao_tomador",   label: "Tomador" },
                        { key: "valor_servicos",  label: "Valor" },
                        { key: "status",          label: "Status" },
                      ].map((col) => (
                        <th key={col.key}
                          className="table-th cursor-pointer select-none hover:bg-slate-100 transition-colors"
                          onClick={() => handleSort(col.key)}>
                          <span className="flex items-center gap-1">
                            {col.label} <SortIcon field={col.key} />
                          </span>
                        </th>
                      ))}
                      <th className="table-th text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                          Nenhuma nota encontrada
                        </td>
                      </tr>
                    ) : data?.items.map((nota) => (
                      <tr key={nota.id} className="table-tr">
                        <td className="table-td">
                          <input type="checkbox" className="rounded"
                            checked={selected.has(nota.id)}
                            onChange={() => toggleSelect(nota.id)} />
                        </td>
                        <td className="table-td font-mono text-xs">{nota.numero || "—"}</td>
                        <td className="table-td">{formatDate(nota.data_emissao)}</td>
                        <td className="table-td max-w-[180px]">
                          <div className="truncate font-medium">{nota.prestador || "—"}</div>
                          <div className="text-xs text-slate-400">{formatCNPJ(nota.cnpj_prestador)}</div>
                        </td>
                        <td className="table-td max-w-[180px]">
                          <div className="truncate">{nota.tomador || "—"}</div>
                          <div className="text-xs text-slate-400">{formatCNPJ(nota.cnpj_tomador)}</div>
                        </td>
                        <td className="table-td font-semibold">{formatCurrency(nota.valor_servicos)}</td>
                        <td className="table-td"><StatusBadge status={nota.status} /></td>
                        <td className="table-td text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => router.push(`/nfse/${nota.id}`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-brand-600 transition-colors"
                              title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => downloadXml(nota.id, nota.numero || nota.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="Baixar XML">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data && (
                <Pagination page={page} totalPages={data.total_pages}
                  onPageChange={(p) => fetchData(p)} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
