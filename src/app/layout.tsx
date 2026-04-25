import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmitNFe — Gestão de NFS-e",
  description: "Sistema profissional de gestão de Notas Fiscais de Serviço",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "14px", borderRadius: "10px" },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
