import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Dish } from "./types";
import { initialDishes } from "./initialData";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

interface DishesContextType {
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  addDish: (dish: Omit<Dish, "id" | "recommended">) => void;
  updateDish: (id: string, updatedFields: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  toggleAvailable: (id: string) => void;
  toggleRecommended: (id: string) => void;
}

const DishesContext = createContext<DishesContextType | null>(null);

export function DishesProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = usePersistedState<Dish[]>("dishes", initialDishes);

  useEffect(() => {
    db.fetchDishes().then((fetched) => {
      if (fetched.length > 0) setDishes(fetched);
    });
  }, []);

  const addDish = useCallback((dish: Omit<Dish, "id" | "recommended">) => {
    const newDish: Dish = { ...dish, id: String(Date.now()), recommended: false };
    setDishes((prev) => [...prev, newDish]);
    db.saveDish(newDish);
  }, [setDishes]);

  const updateDish = useCallback((id: string, updatedFields: Partial<Dish>) => {
    setDishes((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
      const dish = updated.find((d) => d.id === id);
      if (dish) db.saveDish(dish);
      return updated;
    });
  }, [setDishes]);

  const removeDish = useCallback((id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
    db.deleteDish(id);
  }, [setDishes]);

  const toggleAvailable = useCallback((id: string) => {
    setDishes((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d));
      const dish = updated.find((d) => d.id === id);
      if (dish) db.saveDish(dish);
      return updated;
    });
  }, [setDishes]);

  const toggleRecommended = useCallback((id: string) => {
    setDishes((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, recommended: !d.recommended } : d));
      const dish = updated.find((d) => d.id === id);
      if (dish) db.saveDish(dish);
      return updated;
    });
  }, [setDishes]);

  return (
    <DishesContext.Provider
      value={{ dishes, setDishes, addDish, updateDish, removeDish, toggleAvailable, toggleRecommended }}
    >
      {children}
    </DishesContext.Provider>
  );
}

export function useDishes() {
  const ctx = useContext(DishesContext);
  if (!ctx) throw new Error("useDishes must be used within DishesProvider");
  return ctx;
}
