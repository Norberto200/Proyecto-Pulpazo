import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import type { UserRole } from "./types";

interface AuthContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>("administrador");
  const [userName, setUserName] = useState("Admin");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("pulpazo-theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (meta?.role) setUserRole(meta.role as UserRole);
        if (meta?.full_name) setUserName(meta.full_name);
      }
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (meta?.role) setUserRole(meta.role as UserRole);
        if (meta?.full_name) setUserName(meta.full_name);
      } else {
        setUserRole("administrador");
        setUserName("Admin");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("pulpazo-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUserRole("administrador");
    setUserName("Admin");
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, userName, logout, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
