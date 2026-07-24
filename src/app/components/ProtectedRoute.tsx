import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { supabase } from "@/lib/supabase";
import { canAccess } from "@/app/permissions";
import type { UserRole } from "@/app/context/types";
import { ShieldAlert } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("administrador");
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (meta?.role) setUserRole(meta.role as UserRole);
      }
      setLoading(false);
    }).catch(() => {
      setAuthed(false);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (meta?.role) setUserRole(meta.role as UserRole);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return <Navigate to="/" replace />;

  // Role-based route protection
  if (!canAccess(userRole, location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Acceso Restringido</h2>
          <p className="text-gray-400 text-sm">
            Tu rol <span className="text-primary font-semibold capitalize">{userRole}</span> no tiene permiso para acceder a esta sección.
          </p>
          <p className="text-gray-500 text-xs">Contacta al administrador si necesitas acceso.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
