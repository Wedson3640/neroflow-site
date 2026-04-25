"use client";
import { useState } from "react";
import { Save, Loader2, Settings2, Building2, Calculator } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import toast from "react-hot-toast";

interface Config {
  aliquota_iss: string;
  municipio_codigo: string;
  municipio_nome: string;
  uf: string;
  regime_tributacao: string;
  optante_simples: boolean;
  iss_retido_padrao: boolean;
  exigibilidade_iss: string;
}

export default function ConfiguracoesPage() {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Config>({
    aliquota_iss: "5.00",
    municipio_codigo: "",
    municipio_nome: "",
    uf: "",
    regime_tributacao: "1",
    optante_simples: false,
    iss_retido_padrao: false,
    exigibilidade_iss: "1",
  });

  function set(field: keyof Config, value: string | boolean) {
    setConfig((c) => ({ ...c, [field]: value }));
  }

  async function save() {
    setSaving(true);
    // Simulação — em produção enviaria para /api/v1/configuracoes
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Configurações salvas!");
    setSaving(false);
  }

  return (
    <div>
      <Topbar title="Configurações" subtitle="Parâmetros fiscais e de integração" />
      <div className="p-6 max-w-3xl space-y-6">

        {/* Tributação */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Parâmetros Fiscais</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alíquota ISS padrão (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="input-field"
                value={config.aliquota_iss}
                onChange={(e) => set("aliquota_iss", e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-1">Usada nos cálculos do dashboard</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Exigibilidade ISS</label>
              <select className="input-field" value={config.exigibilidade_iss} onChange={(e) => set("exigibilidade_iss", e.target.value)}>
                <option value="1">1 – Exigível</option>
                <option value="2">2 – Não incidência</option>
                <option value="3">3 – Isenção</option>
                <option value="4">4 – Exportação</option>
                <option value="5">5 – Imunidade</option>
                <option value="6">6 – Exig. suspensa por decisão judicial</option>
                <option value="7">7 – Exig. suspensa por processo administrativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Regime de tributação</label>
              <select className="input-field" value={config.regime_tributacao} onChange={(e) => set("regime_tributacao", e.target.value)}>
                <option value="1">1 – Microempresa municipal</option>
                <option value="2">2 – Estimativa</option>
                <option value="3">3 – Sociedade de profissionais</option>
                <option value="4">4 – Cooperativa</option>
                <option value="5">5 – MEI – Simples Nacional</option>
                <option value="6">6 – ME EPP – Simples Nacional</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-brand-600"
                checked={config.optante_simples}
                onChange={(e) => set("optante_simples", e.target.checked)}
              />
              <span className="text-sm text-slate-700">Optante pelo Simples Nacional</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-brand-600"
                checked={config.iss_retido_padrao}
                onChange={(e) => set("iss_retido_padrao", e.target.checked)}
              />
              <span className="text-sm text-slate-700">ISS retido na fonte (padrão)</span>
            </label>
          </div>
        </div>

        {/* Localidade */}
        <div className="card space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Município</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Código IBGE</label>
              <input className="input-field" placeholder="0000000" value={config.municipio_codigo}
                onChange={(e) => set("municipio_codigo", e.target.value)} />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome do município</label>
              <input className="input-field" placeholder="Ex: Teresina" value={config.municipio_nome}
                onChange={(e) => set("municipio_nome", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">UF</label>
              <input className="input-field" placeholder="PI" maxLength={2} value={config.uf}
                onChange={(e) => set("uf", e.target.value.toUpperCase())} />
            </div>
          </div>
        </div>

        {/* Salvar */}
        <div className="flex justify-end">
          <button onClick={save} disabled={saving} className="btn-primary px-8">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar configurações</>}
          </button>
        </div>
      </div>
    </div>
  );
}
