"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, Building2, User2, Receipt, Printer } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCurrency, formatDateTime, formatCNPJ } from "@/lib/utils";
import { NFSeDetail } from "@/types";
import toast from "react-hot-toast";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-600" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

export default function NFSeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [nota, setNota] = useState<NFSeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/nfse/${id}`)
      .then((r) => setNota(r.data))
      .catch(() => toast.error("Nota não encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  function downloadXml() {
    if (!nota) return;
    api.get(`/nfse/${id}`).then((r) => {
      const xml = r.data?.json_raw?.xml || "";
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `nfse_${nota.numero || id}.xml`;
      a.click(); URL.revokeObjectURL(url);
      toast.success("XML baixado");
    }).catch(() => toast.error("Erro ao baixar XML"));
  }

  if (loading) return <div><Topbar title="Detalhe NFS-e" /><PageSpinner /></div>;
  if (!nota)   return <div><Topbar title="NFS-e não encontrada" /><div className="p-6 text-slate-500">Nota não encontrada.</div></div>;

  return (
    <div>
      <Topbar title={`NFS-e nº ${nota.numero || "—"}`} subtitle={nota.razao_prestador || undefined} />
      <div className="p-6 space-y-4">

        {/* Ações */}
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => router.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="ml-auto flex gap-2 flex-wrap">
            <button onClick={downloadXml} className="btn-secondary">
              <Download className="w-4 h-4" /> Baixar XML
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
        </div>

        {/* Header Card */}
        <div className="card bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Nota Fiscal de Serviço</p>
              <p className="text-3xl font-bold mt-1">Nº {nota.numero || "—"}</p>
              <p className="text-blue-200 text-sm mt-1">{formatDateTime(nota.data_emissao)}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={nota.status} />
              <p className="text-3xl font-bold mt-2">{formatCurrency(nota.valor_servicos)}</p>
              <p className="text-blue-200 text-xs mt-0.5">Valor dos Serviços</p>
            </div>
          </div>
        </div>

        {/* Identificação */}
        <Section title="Identificação" icon={FileText}>
          <InfoRow label="Competência"        value={nota.competencia} />
          <InfoRow label="Emissão"            value={formatDateTime(nota.data_emissao)} />
          <InfoRow label="Cód. Verificação"   value={nota.codigo_verificacao} />
          <InfoRow label="NSU"                value={nota.nsu} />
          <InfoRow label="Nat. Operação"      value={nota.natureza_operacao} />
          <InfoRow label="Item LC 116"        value={nota.item_lista_servico} />
          <InfoRow label="Cód. CNAE"          value={nota.codigo_cnae} />
          <InfoRow label="ISS Retido"         value={nota.iss_retido === 1 ? "Sim" : "Não"} />
        </Section>

        {/* Prestador */}
        <Section title="Prestador" icon={Building2}>
          <InfoRow label="Razão Social"       value={nota.razao_prestador} />
          <InfoRow label="CNPJ"               value={formatCNPJ(nota.cnpj_prestador)} />
          <InfoRow label="CPF"                value={nota.cpf_prestador} />
          <InfoRow label="Insc. Municipal"    value={nota.im_prestador} />
          <InfoRow label="Município"          value={nota.municipio_prestador} />
          <InfoRow label="UF"                 value={nota.uf_prestador} />
        </Section>

        {/* Tomador */}
        <Section title="Tomador" icon={User2}>
          <InfoRow label="Razão Social"       value={nota.razao_tomador} />
          <InfoRow label="CNPJ"               value={formatCNPJ(nota.cnpj_tomador)} />
          <InfoRow label="CPF"                value={nota.cpf_tomador} />
          <InfoRow label="Insc. Municipal"    value={nota.im_tomador} />
        </Section>

        {/* Discriminação */}
        {nota.discriminacao && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Discriminação dos Serviços</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg p-4">
              {nota.discriminacao}
            </p>
          </div>
        )}

        {/* Valores */}
        <Section title="Valores" icon={Receipt}>
          <InfoRow label="Valor Serviços"         value={formatCurrency(nota.valor_servicos)} />
          <InfoRow label="Valor Deduções"          value={formatCurrency(nota.valor_deducoes)} />
          <InfoRow label="Base de Cálculo"         value={formatCurrency(nota.base_calculo)} />
          <InfoRow label="Alíquota ISS"            value={nota.aliquota ? `${(nota.aliquota * 100).toFixed(2)}%` : "—"} />
          <InfoRow label="Valor ISS"               value={formatCurrency(nota.valor_iss)} />
          <InfoRow label="ISS Retido"              value={formatCurrency(nota.valor_iss_retido)} />
          <InfoRow label="PIS"                     value={formatCurrency(nota.valor_pis)} />
          <InfoRow label="COFINS"                  value={formatCurrency(nota.valor_cofins)} />
          <InfoRow label="INSS"                    value={formatCurrency(nota.valor_inss)} />
          <InfoRow label="IR"                      value={formatCurrency(nota.valor_ir)} />
          <InfoRow label="CSLL"                    value={formatCurrency(nota.valor_csll)} />
          <InfoRow label="Outras Retenções"        value={formatCurrency(nota.outras_retencoes)} />
          <InfoRow label="Desc. Incondicionado"    value={formatCurrency(nota.desconto_incondicionado)} />
          <InfoRow label="Desc. Condicionado"      value={formatCurrency(nota.desconto_condicionado)} />
          <div className="col-span-2 md:col-span-3 lg:col-span-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Valor Líquido</span>
              <span className="text-xl font-bold text-emerald-600">{formatCurrency(nota.valor_liquido ?? 0)}</span>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}
