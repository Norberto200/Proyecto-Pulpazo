import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { Gasto, Abono } from "./types";
import { initialGastos, initialAbonos } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface FinanceContextType {
  gastos: Gasto[];
  addGasto: (gasto: Omit<Gasto, "id" | "date">) => void;
  abonos: Abono[];
  addAbono: (abono: Omit<Abono, "id" | "date">) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [gastos, setGastos] = usePersistedState<Gasto[]>("gastos", initialGastos);
  const [abonos, setAbonos] = usePersistedState<Abono[]>("abonos", initialAbonos);

  useEffect(() => {
    Promise.all([db.fetchGastos(), db.fetchAbonos()]).then(([fetchedGastos, fetchedAbonos]) => {
      if (fetchedGastos.length > 0) setGastos(fetchedGastos);
      if (fetchedAbonos.length > 0) setAbonos(fetchedAbonos);
    });
  }, []);

  const addGasto = useCallback((gasto: Omit<Gasto, "id" | "date">) => {
    const newGasto: Gasto = { ...gasto, id: `g${Date.now()}`, date: new Date().toISOString() };
    setGastos((prev) => [...prev, newGasto]);
    db.saveGasto(newGasto);
  }, [setGastos]);

  const addAbono = useCallback((abono: Omit<Abono, "id" | "date">) => {
    const newAbono: Abono = { ...abono, id: `a${Date.now()}`, date: new Date().toISOString() };
    setAbonos((prev) => [...prev, newAbono]);
    db.saveAbono(newAbono);
  }, [setAbonos]);

  return (
    <FinanceContext.Provider value={{ gastos, addGasto, abonos, addAbono }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
