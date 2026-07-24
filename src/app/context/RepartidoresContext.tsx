import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import type { Repartidor, EntregaRepartidor } from "./types";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface RepartidoresContextType {
  repartidores: Repartidor[];
  setRepartidores: React.Dispatch<React.SetStateAction<Repartidor[]>>;
  entregasRepartidor: EntregaRepartidor[];
  setEntregasRepartidor: React.Dispatch<React.SetStateAction<EntregaRepartidor[]>>;
  addRepartidor: (rp: Repartidor) => Promise<void>;
  updateRepartidor: (rp: Repartidor) => Promise<void>;
  deleteRepartidor: (id: string) => Promise<void>;
  addEntrega: (e: EntregaRepartidor) => Promise<void>;
  updateEntregaStatus: (id: string, estatus: EntregaRepartidor["estatus"]) => Promise<void>;
  cancelarEntrega: (id: string) => Promise<void>;
}

const RepartidoresContext = createContext<RepartidoresContextType | null>(null);

export function RepartidoresProvider({ children }: { children: ReactNode }) {
  const [repartidores, setRepartidores] = usePersistedState<Repartidor[]>("repartidores", []);
  const [entregasRepartidor, setEntregasRepartidor] = usePersistedState<EntregaRepartidor[]>("entregasRepartidor", []);

  useEffect(() => {
    Promise.all([db.fetchRepartidores(), db.fetchEntregasRepartidor()]).then(([fetchedRp, fetchedEr]) => {
      if (fetchedRp.length > 0) setRepartidores(fetchedRp);
      if (fetchedEr.length > 0) setEntregasRepartidor(fetchedEr);
    });
  }, []);

  const addRepartidor = useCallback(async (rp: Repartidor) => {
    setRepartidores(prev => [...prev, rp]);
    await db.saveRepartidor(rp);
  }, []);

  const updateRepartidor = useCallback(async (rp: Repartidor) => {
    setRepartidores(prev => prev.map(r => r.id === rp.id ? rp : r));
    await db.saveRepartidor(rp);
  }, []);

  const deleteRepartidor = useCallback(async (id: string) => {
    setRepartidores(prev => prev.filter(r => r.id !== id));
    await db.deleteRepartidor(id);
  }, []);

  const addEntrega = useCallback(async (e: EntregaRepartidor) => {
    setEntregasRepartidor(prev => [...prev, e]);
    await db.saveEntregaRepartidor(e);
  }, []);

  const updateEntregaStatus = useCallback(async (id: string, estatus: EntregaRepartidor["estatus"]) => {
    setEntregasRepartidor(prev =>
      prev.map(e => e.id === id ? { ...e, estatus } : e)
    );
    const entrega = entregasRepartidor.find(e => e.id === id);
    if (entrega) {
      await db.saveEntregaRepartidor({ ...entrega, estatus });
    }
  }, [entregasRepartidor]);

  const cancelarEntrega = useCallback(async (id: string) => {
    const entrega = entregasRepartidor.find(e => e.id === id);
    if (entrega) {
      setEntregasRepartidor(prev =>
        prev.map(e => e.id === id ? { ...e, estatus: "cancelado" as const } : e)
      );
      await db.saveEntregaRepartidor({ ...entrega, estatus: "cancelado" });
    }
  }, [entregasRepartidor]);

  return (
    <RepartidoresContext.Provider value={{
      repartidores, setRepartidores,
      entregasRepartidor, setEntregasRepartidor,
      addRepartidor, updateRepartidor, deleteRepartidor,
      addEntrega, updateEntregaStatus, cancelarEntrega,
    }}>
      {children}
    </RepartidoresContext.Provider>
  );
}

export function useRepartidores() {
  const ctx = useContext(RepartidoresContext);
  if (!ctx) throw new Error("useRepartidores must be used within RepartidoresProvider");
  return ctx;
}
