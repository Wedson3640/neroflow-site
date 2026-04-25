"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, Plus, Trash2, CheckCircle, XCircle, Upload, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import Topbar from "@/components/layout/Topbar";
import Modal from "@/components/ui/Modal";
import { PageSpinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import { formatCNPJ, formatDate } from "@/lib/utils";
import { Certificate } from "@/types";
import toast from "react-hot-toast";

interface UploadForm {
  cnpj: string;
  empresa: string;
  password: string;
  file: FileList;
}

export default function CertificadosPage() {
  const [certs, setCerts]       = useState<Certificate[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UploadForm>();

  async function loadCerts() {
    try {
      const res = await api.get("/certificates/");
      setCerts(res.data);
    } catch {
      toast.error("Erro ao carregar certificados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCerts(); }, []);

  async function onSubmit(data: UploadForm) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file",     data.file[0]);
      form.append("password", data.password);
      form.append("cnpj",     data.cnpj.replace(/\D/g, ""));
      form.append("empresa",  data.empresa);

      await api.post("/certificates/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Certificado cadastrado com sucesso!");
      setModalOpen(false);
      reset();
      loadCerts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Erro ao cadastrar certificado");
    } finally {
      setUploading(false);
    }
  }

  async function deleteCert(id: string) {
    if (!confirm("Desativar este certificado?")) return;
    setDeleting(id);
    try {
      await api.delete(`/certificates/${id}`);
      toast.success("Certificado desativado");
      setCerts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Erro ao desativar certificado");
    } finally {
      setDeleting(null);
    }
  }

  function isExpired(validUntil: string | null) {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  }

  const fileName = watch("file")?.[0]?.name;

  return (
    <div>
      <Topbar title="Certificados Digitais" subtitle="Gerencie os certificados A1 cadastrados" />
      <div className="p-6 space-y-4">

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{certs.length} certificado(s) ativo(s)</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Novo certificado
          </button>
        </div>

        {loading ? <PageSpinner /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {certs.length === 0 ? (
              <div className="col-span-3 card text-center py-12">
                <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Nenhum certificado cadastrado</p>
                <p className="text-slate-400 text-sm mt-1">Clique em "Novo certificado" para adicionar</p>
              </div>
            ) : certs.map((cert) => {
              const expired = isExpired(cert.valid_until);
              return (
                <div key={cert.id} className="card relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expired ? "bg-red-100" : "bg-emerald-100"}`}>
                      <ShieldCheck className={`w-5 h-5 ${expired ? "text-red-600" : "text-emerald-600"}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      {cert.is_active && !expired ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Ativo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          <XCircle className="w-3 h-3" /> {expired ? "Vencido" : "Inativo"}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-slate-900 text-sm truncate">{cert.subject_name || "Certificado"}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{formatCNPJ(cert.cnpj)}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Validade</p>
                      <p className={`text-sm font-medium ${expired ? "text-red-600" : "text-slate-700"}`}>
                        {formatDate(cert.valid_until)}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCert(cert.id)}
                      disabled={deleting === cert.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {deleting === cert.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal upload */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Cadastrar certificado digital">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">CNPJ *</label>
            <input className="input-field" placeholder="00.000.000/0000-00"
              {...register("cnpj", { required: "CNPJ obrigatório" })} />
            {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Empresa *</label>
            <input className="input-field" placeholder="Razão Social"
              {...register("empresa", { required: "Empresa obrigatória" })} />
            {errors.empresa && <p className="text-red-500 text-xs mt-1">{errors.empresa.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Arquivo .pfx *</label>
            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${fileName ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50 hover:border-brand-400"}`}>
              <Upload className={`w-6 h-6 mb-1 ${fileName ? "text-brand-600" : "text-slate-400"}`} />
              <span className={`text-sm ${fileName ? "text-brand-700 font-medium" : "text-slate-400"}`}>
                {fileName || "Clique para selecionar o arquivo .pfx"}
              </span>
              <input type="file" accept=".pfx" className="hidden"
                {...register("file", { required: "Arquivo obrigatório" })} />
            </label>
            {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha do certificado</label>
            <input type="password" className="input-field" placeholder="Senha (deixe em branco se não houver)"
              {...register("password")} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={uploading} className="btn-primary flex-1 justify-center">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Cadastrar"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
