"use client";
import { useState, useCallback } from "react";
import { FileArchive, FileSpreadsheet, Search, Loader2 } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/ui/StatusBadge";
import Pagination from "@/components/ui/Pagination";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCurrency, formatDate, formatCNPJ } from "@/lib/utils";
import { NFSeListResponse } from "@/types";
import toast from "react-hot-toast";

export default function DownloadPage() {
  const [data, setData]       = useState<NFSeListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<"xml" | "excel" | null>(null);
  const [page, setPage]       = useState(1);
  const [filters, setFilters] = useState({
    data_inicio: "", data_fim: "", filtro_status: "",
  });

  const fetchNotas = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), page_size: "100" });
      if (filters.data_inicio)   params.set("data_inicio",   filters.data_inicio);
      if (filters.data_fim)      params.set("data_fim",      filters.data_fim);
      if (filters.filtro_status) params.set("filtro_status", filters.filtro_status);
      const res = await api.get(`/nfse/listar?${params}`);
      setData(res.data);
      setPage(p);
      setSelected(new Set());
    } catch {
      toast.error("Erro ao buscar notas");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  function toggleAll() {
    if (!data) return;
    if (selected.size === data.items.length) setSelected(new Set());
    else setSelected(new Set(data.items.map((n) => n.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function downloadXmlLista() {
    if (selected.size === 0) { toast.error("Selecione pelo menos uma nota"); return; }
    setExporting("xml");
    try {
      const ids = Array.from(selected);
      const res = await api.post("/nfse/download-xml-lote", { ids }, { responseType: "blob" });
      const url  = URL.createObjectURL(res.data);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `ListaNotaFiscal_${Date.now()}.xml`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${ids.length} nota(s) exportadas em ABRASF`);
    } catch {
      toast.error("Erro ao gerar XML");
    } finally {
      setExporting(null);
    }
  }

  async function exportExcel() {
    if (!data || data.items.length === 0) { toast.error("Carregue as notas primeiro"); return; }
    setExporting("excel");
    try {
      const ids = selected.size > 0 ? Array.from(selected) : data.items.map((n) => n.id);
      const rows = [
        ["Número", "Data Emissão", "Prestador", "CNPJ Prestador", "Tomador", "CNPJ Tomador", "Valor Serviços", "Status"],
        ...data.items
          .filter((n) => ids.includes(n.id))
          .map((n) => [
            n.numero || "",
            formatDate(n.data_emissao),
            n.prestador || "",
            formatCNPJ(n.cnpj_prestador),
            n.tomador || "",
            formatCNPJ(n.cnpj_tomador),
            n.valor_servicos.toFixed(2),
            n.status,
          ]),
      ];
      const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `nfse_${Date.now()}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success(`${ids.length} registros exportados`);
    } catch {
      toast.error("Erro ao exportar");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div>
      <Topbar title="Downloads" subtitle="Exporte e baixe suas NFS-e" />
      <div className="p-6 space-y-4">

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="date" className="input-field" value={filters.data_inicio}
              onChange={(e) => setFilters((f) => ({ ...f, data_inicio: e.target.value }))} />
            <input type="date" className="input-field" value={filters.data_fim}
              onChange={(e) => setFilters((f) => ({ ...f, data_fim: e.target.value }))} />
            <select className="input-field" value={filters.filtro_status}
              onChange={(e) => setFilters((f) => ({ ...f, filtro_status: e.target.value }))}>
              <option value="">Todos os status</option>
              {["NORMAL","CANCELADA","SUBSTITUIDA"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => fetchNotas(1)} className="btn-primary mt-3">
            <Search className="w-4 h-4" /> Buscar notas
          </button>
        </div>

        {/* Ações de download */}
        {data && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-500">
              {selected.size > 0 ? `${selected.size} selecionadas` : `${data.total} notas carregadas`}
            </span>
            <div className="ml-auto flex gap-2">
              <button onClick={downloadXmlLista} disabled={!!exporting} className="btn-secondary">
                {exporting === "xml" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
                Baixar XML (ListaNotaFiscal)
              </button>
              <button onClick={exportExcel} disabled={!!exporting} className="btn-primary">
                {exporting === "excel" ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Exportar CSV
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        {loading ? <PageSpinner /> : data && (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="table-th w-10">
                      <input type="checkbox" className="rounded" checked={selected.size === data.items.length && data.items.length > 0} onChange={toggleAll} />
                    </th>
                    <th className="table-th">Nº</th>
                    <th className="table-th">Emissão</th>
                    <th className="table-th">Prestador</th>
                    <th className="table-th">Valor</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((nota) => (
                    <tr key={nota.id} className="table-tr">
                      <td className="table-td">
                        <input type="checkbox" className="rounded" checked={selected.has(nota.id)} onChange={() => toggleOne(nota.id)} />
                      </td>
                      <td className="table-td font-mono text-xs">{nota.numero || "—"}</td>
                      <td className="table-td">{formatDate(nota.data_emissao)}</td>
                      <td className="table-td">
                        <div className="font-medium text-sm truncate max-w-[200px]">{nota.prestador || "—"}</div>
                        <div className="text-xs text-slate-400">{formatCNPJ(nota.cnpj_prestador)}</div>
                      </td>
                      <td className="table-td font-semibold">{formatCurrency(nota.valor_servicos)}</td>
                      <td className="table-td"><StatusBadge status={nota.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={data.total_pages} onPageChange={(p) => fetchNotas(p)} />
          </div>
        )}
      </div>
    </div>
  );
}
