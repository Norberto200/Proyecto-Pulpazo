import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import type { Descuento } from "./types";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface DiscountsContextType {
  descuentos: Descuento[];
  setDescuentos: React.Dispatch<React.SetStateAction<Descuento[]>>;
  addDescuento: (d: Descuento) => Promise<void>;
  updateDescuento: (id: string, updatedFields: Partial<Descuento>) => Promise<void>;
  deleteDescuento: (id: string) => Promise<void>;
  findDescuentoByCode: (code: string) => Descuento | undefined;
  incrementarUso: (id: string) => Promise<void>;
}

const DiscountsContext = createContext<DiscountsContextType | null>(null);

export function DiscountsProvider({ children }: { children: ReactNode }) {
  const [descuentos, setDescuentos] = usePersistedState<Descuento[]>("descuentos", []);

  useEffect(() => {
    db.fetchDescuentos().then(fetched => {
      if (fetched.length > 0) setDescuentos(fetched);
    });
  }, []);

  const addDescuento = useCallback(async (d: Descuento) => {
    setDescuentos(prev => [...prev, d]);
    await db.saveDescuento(d);
  }, []);

  const updateDescuento = useCallback(async (id: string, updatedFields: Partial<Descuento>) => {
    setDescuentos(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    const found = descuentos.find(d => d.id === id);
    if (found) {
      await db.saveDescuento({ ...found, ...updatedFields });
    }
  }, [descuentos]);

  const deleteDescuento = useCallback(async (id: string) => {
    setDescuentos(prev => prev.filter(d => d.id !== id));
    await db.deleteDescuento(id);
  }, []);

  const findDescuentoByCode = useCallback((code: string) => {
    return descuentos.find(d => d.codigo.toUpperCase() === code.toUpperCase() && d.activo);
  }, [descuentos]);

  const incrementarUso = useCallback(async (id: string) => {
    setDescuentos(prev => prev.map(d => d.id === id ? { ...d, usosActuales: d.usosActuales + 1 } : d));
    const found = descuentos.find(d => d.id === id);
    if (found) {
      await db.saveDescuento({ ...found, usosActuales: found.usosActuales + 1 });
    }
  }, [descuentos]);

  return (
    <DiscountsContext.Provider value={{
      descuentos, setDescuentos,
      addDescuento, updateDescuento, deleteDescuento,
      findDescuentoByCode, incrementarUso,
    }}>
      {children}
    </DiscountsContext.Provider>
  );
}

export function useDiscounts() {
  const ctx = useContext(DiscountsContext);
  if (!ctx) throw new Error("useDiscounts must be used within DiscountsProvider");
  return ctx;
}
