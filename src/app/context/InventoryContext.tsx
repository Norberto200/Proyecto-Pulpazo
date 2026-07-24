import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { Insumo } from "./types";
import { initialInsumos } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface InventoryContextType {
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  addInsumo: (insumo: Omit<Insumo, "id">) => void;
  updateInsumo: (id: string, updatedFields: Partial<Insumo>) => void;
  removeInsumo: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [insumos, setInsumos] = usePersistedState<Insumo[]>("insumos", initialInsumos);

  useEffect(() => {
    db.fetchInsumos().then((fetched) => {
      if (fetched.length > 0) setInsumos(fetched);
    });
  }, []);

  const addInsumo = useCallback((insumo: Omit<Insumo, "id">) => {
    const newInsumo: Insumo = { ...insumo, id: `i${Date.now()}` };
    setInsumos((prev) => [...prev, newInsumo]);
    db.saveInsumo(newInsumo);
  }, [setInsumos]);

  const updateInsumo = useCallback((id: string, updatedFields: Partial<Insumo>) => {
    setInsumos((prev) => {
      const updated = prev.map((i) => (i.id === id ? { ...i, ...updatedFields } : i));
      const insumo = updated.find((i) => i.id === id);
      if (insumo) db.saveInsumo(insumo);
      return updated;
    });
  }, [setInsumos]);

  const removeInsumo = useCallback((id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
    db.deleteInsumo(id);
  }, [setInsumos]);

  return (
    <InventoryContext.Provider value={{ insumos, setInsumos, addInsumo, updateInsumo, removeInsumo }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
