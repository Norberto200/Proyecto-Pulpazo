import { createContext, useContext, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem, Order, Insumo, DishIngredient } from "./types";
import type { useDishes } from "./DishesContext";
import type { useTables } from "./TablesContext";
import type { useInventory } from "./InventoryContext";
import type { useRecipes } from "./RecipesContext";
import { useState } from "react";
import { usePersistedState } from "./usePersistedState";
import { db } from "../../lib/supabase-service";

type OrderType = "local" | "llevar" | "domicilio" | "uber" | "rappi";

interface StockWarning {
  insumo: string;
  required: number;
  available: number;
  unit: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (paymentMethod: string, table?: string) => void;
  placeOrderDetailed: (params: {
    paymentMethod: string;
    table?: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: OrderType;
    descuento?: number;
  }) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  currentTableId: string | null;
  setCurrentTableId: (id: string | null) => void;
  checkStock: () => StockWarning[];
}

interface CartProviderProps {
  children: ReactNode;
  tablesContext: ReturnType<typeof useTables>;
  dishesContext: ReturnType<typeof useDishes>;
  inventoryContext: ReturnType<typeof useInventory>;
  recipesContext: ReturnType<typeof useRecipes>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children, tablesContext, dishesContext, inventoryContext, recipesContext }: CartProviderProps & { children: ReactNode }) {
  const { tables, setTables } = tablesContext;
  const { dishes } = dishesContext;
  const { insumos, setInsumos } = inventoryContext;
  const { recetas } = recipesContext;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = usePersistedState<Order[]>("orders", []);
  const [currentTableId, setCurrentTableId] = useState<string | null>(null);

  useEffect(() => {
    db.fetchOrders().then((fetched) => {
      if (fetched.length > 0) setOrders(fetched);
    });
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const checkStock = useCallback((): StockWarning[] => {
    const warnings: StockWarning[] = [];
    for (const item of cartItems) {
      const itemRecetas = recetas.filter(r => r.dishId === item.id);
      for (const receta of itemRecetas) {
        const insumo = insumos.find(i => i.id === receta.insumoId);
        if (!insumo) continue;
        const required = receta.cantidad * item.quantity;
        if (insumo.stockActual < required) {
          warnings.push({
            insumo: insumo.name,
            required,
            available: insumo.stockActual,
            unit: insumo.unit,
          });
        }
      }
    }
    return warnings;
  }, [cartItems, recetas, insumos]);

  const placeOrderDetailed = useCallback((params: {
    paymentMethod: string;
    table?: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: OrderType;
    descuento?: number;
  }) => {
    if (cartItems.length === 0) return;
    const descuento = params.descuento || 0;
    const subtotalAfterDiscount = Math.max(0, cartTotal - descuento);
    const ivaAmount = subtotalAfterDiscount * 0.16;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: subtotalAfterDiscount,
      subtotal: cartTotal,
      iva: ivaAmount,
      totalConIva: subtotalAfterDiscount + ivaAmount,
      paymentMethod: params.paymentMethod,
      status: "pendiente",
      table: params.table,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      clientAddress: params.clientAddress,
      notes: params.notes,
      orderType: params.orderType,
      descuento,
    };

    setOrders((prev) => [order, ...prev]);
    db.saveOrder(order);

    // Auto-decrement inventory stock
    const updatedInsumos = [...insumos];
    for (const item of cartItems) {
      const itemRecetas = recetas.filter(r => r.dishId === item.id);
      for (const receta of itemRecetas) {
        const idx = updatedInsumos.findIndex(i => i.id === receta.insumoId);
        if (idx !== -1) {
          const consumed = receta.cantidad * item.quantity;
          updatedInsumos[idx] = {
            ...updatedInsumos[idx],
            stockActual: Math.max(0, parseFloat((updatedInsumos[idx].stockActual - consumed).toFixed(2))),
          };
        }
      }
    }
    // Persist all updated insumos
    setInsumos(updatedInsumos);
    for (const insumo of updatedInsumos) {
      db.saveInsumo(insumo);
    }

    // Only set table to ocupado when order is placed for local dining
    if (params.table && params.orderType === "local") {
      setTables((prev) => {
        const updated = prev.map((t) =>
          t.id === params.table ? { ...t, status: "ocupado" as const, time: "00:01 h" } : t
        );
        const table = updated.find((t) => t.id === params.table);
        if (table) db.saveTable(table);
        return updated;
      });
    }

    setCartItems([]);
    setCurrentTableId(null);
  }, [cartItems, cartTotal, setTables, insumos, setInsumos, recetas]);

  const updateOrderStatus = useCallback((orderId: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      const order = updated.find((o) => o.id === orderId);
      if (order) db.saveOrder(order);
      return updated;
    });
  }, [setOrders]);

  const placeOrder = useCallback((paymentMethod: string, table?: string) => {
    placeOrderDetailed({
      paymentMethod,
      table,
      orderType: table ? "local" : "llevar",
    });
  }, [placeOrderDetailed]);

  return (
    <CartContext.Provider
      value={{
        cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
        cartTotal, cartCount, orders, setOrders, placeOrder, placeOrderDetailed,
        updateOrderStatus, currentTableId, setCurrentTableId, checkStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
