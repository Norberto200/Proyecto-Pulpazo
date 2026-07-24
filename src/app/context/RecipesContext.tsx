import { createContext, useContext, useEffect, useCallback, type ReactNode } from "react";
import type { DishIngredient } from "./types";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface RecipesContextType {
  recetas: DishIngredient[];
  setRecetas: React.Dispatch<React.SetStateAction<DishIngredient[]>>;
  addReceta: (receta: DishIngredient) => Promise<void>;
  updateReceta: (id: string, updatedFields: Partial<DishIngredient>) => Promise<void>;
  deleteReceta: (id: string) => Promise<void>;
  getRecetasByDish: (dishId: string) => DishIngredient[];
  deleteRecetasByDish: (dishId: string) => Promise<void>;
}

const RecipesContext = createContext<RecipesContextType | null>(null);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [recetas, setRecetas] = usePersistedState<DishIngredient[]>("recetas", []);

  useEffect(() => {
    db.fetchRecetas().then(fetched => {
      if (fetched.length > 0) setRecetas(fetched);
    });
  }, []);

  const addReceta = useCallback(async (receta: DishIngredient) => {
    setRecetas(prev => [...prev, receta]);
    await db.saveReceta(receta);
  }, []);

  const updateReceta = useCallback(async (id: string, updatedFields: Partial<DishIngredient>) => {
    setRecetas(prev => prev.map(r => r.id === id ? { ...r, ...updatedFields } : r));
    const found = recetas.find(r => r.id === id);
    if (found) {
      await db.saveReceta({ ...found, ...updatedFields });
    }
  }, [recetas]);

  const deleteReceta = useCallback(async (id: string) => {
    setRecetas(prev => prev.filter(r => r.id !== id));
    await db.deleteReceta(id);
  }, []);

  const getRecetasByDish = useCallback((dishId: string) => {
    return recetas.filter(r => r.dishId === dishId);
  }, [recetas]);

  const deleteRecetasByDish = useCallback(async (dishId: string) => {
    const toDelete = recetas.filter(r => r.dishId === dishId);
    setRecetas(prev => prev.filter(r => r.dishId !== dishId));
    for (const r of toDelete) {
      await db.deleteReceta(r.id);
    }
  }, [recetas]);

  return (
    <RecipesContext.Provider value={{
      recetas, setRecetas,
      addReceta, updateReceta, deleteReceta,
      getRecetasByDish, deleteRecetasByDish,
    }}>
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error("useRecipes must be used within RecipesProvider");
  return ctx;
}
