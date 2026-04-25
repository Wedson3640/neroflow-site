"use client";
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Verifica token a cada 5 minutos enquanto o dashboard estiver aberto
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = Cookies.get("token");
    if (t) {
      setToken(t);
      fetchMe(t);
    } else {
      setLoading(false);
    }

    return () => clearInterval(intervalRef.current ?? undefined);
  }, []);

  // Inicia verificação periódica quando o usuário está logado
  useEffect(() => {
    if (!user) { clearInterval(intervalRef.current ?? undefined); return; }

    intervalRef.current = setInterval(() => {
      const t = Cookies.get("token");
      if (!t) { clearSession(); return; }
      fetchMe(t);
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current ?? undefined);
  }, [user]);

  async function fetchMe(t: string) {
    try {
      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      setUser(res.data);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }

  function clearSession() {
    Cookies.remove("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    const res = await api.post("/auth/token", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const { access_token } = res.data;
    Cookies.set("token", access_token, { expires: 7, sameSite: "strict" });
    setToken(access_token);
    await fetchMe(access_token);
  }

  function logout() {
    clearSession();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
