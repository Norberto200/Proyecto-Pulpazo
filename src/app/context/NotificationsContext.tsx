import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import type { Notificacion } from "./types";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface NotificationsContextType {
  notificaciones: Notificacion[];
  addNotificacion: (n: Omit<Notificacion, "id" | "leida" | "fecha">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotificacion: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notificaciones, setNotificaciones] = usePersistedState<Notificacion[]>("notificaciones", []);

  useEffect(() => {
    db.fetchNotificaciones().then(fetched => {
      if (fetched.length > 0) setNotificaciones(fetched);
    });
  }, []);

  const addNotificacion = useCallback((n: Omit<Notificacion, "id" | "leida" | "fecha">) => {
    const newNotif: Notificacion = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      leida: false,
      fecha: new Date().toISOString(),
    };
    setNotificaciones(prev => [newNotif, ...prev].slice(0, 100));
    db.saveNotificacion(newNotif);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    const found = notificaciones.find(n => n.id === id);
    if (found) db.saveNotificacion({ ...found, leida: true });
  }, [notificaciones]);

  const markAllAsRead = useCallback(() => {
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
    for (const n of notificaciones.filter(n => !n.leida)) {
      db.saveNotificacion({ ...n, leida: true });
    }
  }, [notificaciones]);

  const deleteNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
    db.deleteNotificacion(id);
  }, []);

  const clearAll = useCallback(() => {
    for (const n of notificaciones) {
      db.deleteNotificacion(n.id);
    }
    setNotificaciones([]);
  }, [notificaciones]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return (
    <NotificationsContext.Provider value={{
      notificaciones, addNotificacion, markAsRead, markAllAsRead,
      deleteNotificacion, clearAll, unreadCount,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
