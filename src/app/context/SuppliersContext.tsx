import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Promotor, Entrega } from "./types";
import { initialPromotores, initialEntregas } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface SuppliersContextType {
  promotores: Promotor[];
  setPromotores: React.Dispatch<React.SetStateAction<Promotor[]>>;
  entregas: Entrega[];
  setEntregas: React.Dispatch<React.SetStateAction<Entrega[]>>;
}

const SuppliersContext = createContext<SuppliersContextType | null>(null);

export function SuppliersProvider({ children }: { children: ReactNode }) {
  const [promotores, setPromotores] = usePersistedState<Promotor[]>("promotores", initialPromotores);
  const [entregas, setEntregas] = usePersistedState<Entrega[]>("entregas", initialEntregas);

  useEffect(() => {
    Promise.all([db.fetchPromotores(), db.fetchEntregas()]).then(([fetchedPromotores, fetchedEntregas]) => {
      if (fetchedPromotores.length > 0) setPromotores(fetchedPromotores);
      if (fetchedEntregas.length > 0) setEntregas(fetchedEntregas);
    });
  }, []);

  return (
    <SuppliersContext.Provider value={{ promotores, setPromotores, entregas, setEntregas }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error("useSuppliers must be used within SuppliersProvider");
  return ctx;
}
