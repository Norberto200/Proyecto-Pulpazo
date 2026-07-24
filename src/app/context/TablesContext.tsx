import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { Table } from "./types";
import { initialTables } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface TablesContextType {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  addTable: (table: Omit<Table, "status">) => void;
  updateTable: (id: string, updatedFields: Partial<Table>) => void;
  removeTable: (id: string) => void;
}

const TablesContext = createContext<TablesContextType | null>(null);

export function TablesProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = usePersistedState<Table[]>("tables", initialTables);

  useEffect(() => {
    db.fetchTables().then((fetched) => {
      if (fetched.length > 0) setTables(fetched);
    });
  }, []);

  const addTable = useCallback((table: Omit<Table, "status">) => {
    const newTable: Table = { ...table, status: "libre" };
    setTables((prev) => [...prev, newTable]);
    db.saveTable(newTable);
  }, [setTables]);

  const updateTable = useCallback((id: string, updatedFields: Partial<Table>) => {
    setTables((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
      const table = updated.find((t) => t.id === id);
      if (table) db.saveTable(table);
      return updated;
    });
  }, [setTables]);

  const removeTable = useCallback((id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    db.deleteTable(id);
  }, [setTables]);

  return (
    <TablesContext.Provider value={{ tables, setTables, addTable, updateTable, removeTable }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error("useTables must be used within TablesProvider");
  return ctx;
}
