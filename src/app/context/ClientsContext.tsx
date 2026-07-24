import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { Cliente } from "./types";
import { initialClientes } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface ClientsContextType {
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, updatedFields: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = usePersistedState<Cliente[]>("clientes", initialClientes);

  useEffect(() => {
    db.fetchClientes().then((fetched) => {
      if (fetched.length > 0) setClientes(fetched);
    });
  }, []);

  const addCliente = useCallback((cliente: Omit<Cliente, "id">) => {
    const newCliente: Cliente = { ...cliente, id: `c${Date.now()}` };
    setClientes((prev) => [...prev, newCliente]);
    db.saveCliente(newCliente);
  }, [setClientes]);

  const updateCliente = useCallback((id: string, updatedFields: Partial<Cliente>) => {
    setClientes((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
      const cliente = updated.find((c) => c.id === id);
      if (cliente) db.saveCliente(cliente);
      return updated;
    });
  }, [setClientes]);

  const deleteCliente = useCallback((id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    db.deleteCliente(id);
  }, [setClientes]);

  return (
    <ClientsContext.Provider value={{ clientes, addCliente, updateCliente, deleteCliente }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be used within ClientsProvider");
  return ctx;
}
