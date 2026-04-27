"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginForm {
  email: string;
  password: string;
}

function LoginContent() {
  const { login } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Bem-vindo!");
      const redirect = searchParams.get("redirect") || "/";
      router.replace(redirect);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail || "Credenciais inválidas";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">EmitNFe</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestão inteligente<br />de NFS-e
          </h1>
          <p className="text-slate-400 text-lg">
            Controle, consulte e exporte suas notas fiscais de serviço com praticidade e segurança.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Notas gerenciadas", value: "50k+" },
            { label: "Empresas ativas",   value: "1.2k" },
            { label: "Disponibilidade",   value: "99.9%" },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 text-xl font-bold">EmitNFe</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Entrar na conta</h2>
          <p className="text-slate-500 text-sm mb-8">Acesse o painel de gestão de NFS-e</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                {...register("email", { required: "E-mail obrigatório" })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  {...register("password", { required: "Senha obrigatória" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            © {new Date().getFullYear()} Neroflow · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
