import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { db } from "../../lib/supabase-service";
import { supabase } from "../../lib/supabase";

export type DishCategory = "Entradas" | "Platos Fuertes" | "Bebidas" | "Postres";

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
  available: boolean;
  recommended: boolean;
  image: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: "completado" | "pendiente" | "cancelado";
  table?: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  notes?: string;
  orderType: "local" | "llevar" | "uber" | "rappi";
}

export type TableStatus = "libre" | "ocupado" | "reservado";
export type TableShape = "rectangular" | "circular";

export interface Table {
  id: string;
  name: string;
  type: TableShape;
  status: TableStatus;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  rotation?: number;
  time?: string;
}

export interface Insumo {
  id: string;
  name: string;
  stockActual: number;
  stockMinimo: number;
  unit: string;
}

export type UserRole = "administrador" | "cajera" | "mesero";

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Gasto {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Abono {
  id: string;
  clientName: string;
  amount: number;
  date: string;
}

interface AppContextType {
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
    orderType: "local" | "llevar" | "uber" | "rappi";
  }) => void;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  addDish: (dish: Omit<Dish, "id" | "recommended">) => void;
  updateDish: (id: string, updatedFields: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  toggleAvailable: (id: string) => void;
  toggleRecommended: (id: string) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  addTable: (table: Omit<Table, "status">) => void;
  updateTable: (id: string, updatedFields: Partial<Table>) => void;
  removeTable: (id: string) => void;
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  addInsumo: (insumo: Omit<Insumo, "id">) => void;
  updateInsumo: (id: string, updatedFields: Partial<Insumo>) => void;
  removeInsumo: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, updatedFields: Partial<Cliente>) => void;
  gastos: Gasto[];
  addGasto: (gasto: Omit<Gasto, "id" | "date">) => void;
  abonos: Abono[];
  addAbono: (abono: Omit<Abono, "id" | "date">) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialDishes: Dish[] = [
  { id: "1", name: "Ceviche Mixto", description: "Camarón y pescado fresco marinado en limón, cilantro, cebolla morada y aguacate", price: 169.00, category: "Entradas", available: true, recommended: true, image: "https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop" },
  { id: "2", name: "Tostada de Mariscos", description: "Tostada crujiente con ceviche de camarón, pulpo y aderezo especial de chipotle", price: 85.00, category: "Entradas", available: true, recommended: true, image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop" },
  { id: "3", name: "Cóctel de Camarón", description: "Camarones selectos en nuestra salsa coctelera artesanal con cilantro y aguacate", price: 145.00, category: "Entradas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1559058922-4c2c2c8d9f1d?w=400&h=300&fit=crop" },
  { id: "4", name: "Filete al Mojo de Ajo", description: "Filete de pescado a la plancha bañado en ajo dorado al sartén, servido con arroz y ensalada", price: 189.00, category: "Platos Fuertes", available: true, recommended: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop" },
  { id: "5", name: "Caldo de Mariscos", description: "Tradicional sopa caliente de la casa con camarón, pulpo, almejas y verduras", price: 195.00, category: "Platos Fuertes", available: true, recommended: false, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop" },
  { id: "6", name: "Michelada Pescadora", description: "Cerveza fría preparada con nuestra mezcla secreta de salsas negras, limón y clamato", price: 95.00, category: "Bebidas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1596546335970-1dfa5d0a4126?w=400&h=300&fit=crop" },
  { id: "7", name: "Agua de Horchata", description: "Agua fresca tradicional con canela y un toque cremoso", price: 35.00, category: "Bebidas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop" },
  { id: "8", name: "Pay de Limón", description: "Pay cremoso helado con galleta maría y ralladura de limón fresco", price: 65.00, category: "Postres", available: true, recommended: true, image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop" },
];

const initialTables: Table[] = [
  { id: "A1", name: "A1", type: "rectangular", status: "libre", x: 50, y: 80, width: 80, height: 40 },
  { id: "A2", name: "A2", type: "rectangular", status: "ocupado", x: 150, y: 80, width: 80, height: 40, time: "00:45 h" },
  { id: "A3", name: "A3", type: "rectangular", status: "reservado", x: 250, y: 80, width: 80, height: 40 },
  { id: "A4", name: "A4", type: "rectangular", status: "libre", x: 350, y: 80, width: 80, height: 40 },
  { id: "B1", name: "B1", type: "circular", status: "libre", x: 85, y: 180, radius: 30 },
  { id: "B2", name: "B2", type: "circular", status: "ocupado", x: 185, y: 180, radius: 30, time: "01:15 h" },
  { id: "B3", name: "B3", type: "circular", status: "libre", x: 285, y: 180, radius: 30 },
  { id: "B4", name: "B4", type: "circular", status: "reservado", x: 385, y: 180, radius: 30 },
  { id: "C1", name: "C1", type: "rectangular", status: "ocupado", x: 50, y: 280, width: 80, height: 40, time: "01:24 h" },
  { id: "C2", name: "C2", type: "rectangular", status: "libre", x: 150, y: 280, width: 80, height: 40 },
  { id: "C3", name: "C3", type: "rectangular", status: "ocupado", x: 250, y: 280, width: 80, height: 40, time: "00:30 h" },
  { id: "C4", name: "C4", type: "rectangular", status: "libre", x: 350, y: 280, width: 80, height: 40 },
  { id: "D1", name: "D1", type: "circular", status: "reservado", x: 85, y: 380, radius: 30 },
  { id: "D2", name: "D2", type: "circular", status: "libre", x: 185, y: 380, radius: 30 },
  { id: "D3", name: "D3", type: "circular", status: "ocupado", x: 285, y: 380, radius: 30, time: "02:10 h" },
  { id: "D4", name: "D4", type: "circular", status: "libre", x: 385, y: 380, radius: 30 },
];

const sampleOrders: Order[] = [];

const initialInsumos: Insumo[] = [
  { id: "i1", name: "Pulpo Fresco", stockActual: 15, stockMinimo: 5, unit: "kg" },
  { id: "i2", name: "Aceite de Oliva", stockActual: 10, stockMinimo: 2, unit: "L" },
  { id: "i3", name: "Pimentón de la Vera", stockActual: 2, stockMinimo: 0.5, unit: "kg" },
  { id: "i4", name: "Patatas Cocidas", stockActual: 40, stockMinimo: 10, unit: "kg" },
  { id: "i5", name: "Sal de Grano", stockActual: 1.2, stockMinimo: 2, unit: "kg" },
];

const initialClientes: Cliente[] = [
  { id: "c1", name: "Juan Pérez", phone: "5551234567", address: "Av. Marina 123, Col. Centro" },
  { id: "c2", name: "María Gómez", phone: "5559876543", address: "Calle Acuario 45, Fracc. Las Olas" },
  { id: "c3", name: "Carlos López", phone: "5554567890", address: "Blvd. Costero 789, Depto 4" },
];

const initialGastos: Gasto[] = [
  { id: "g1", description: "Compra de Tortillas (Proveedor)", amount: 350.00, category: "Materia Prima", date: "2026-07-10T11:00:00" },
  { id: "g2", description: "Refrescos Coca-Cola (Distribuidora)", amount: 1200.00, category: "Bebidas", date: "2026-07-10T12:30:00" },
  { id: "g3", description: "Cerveza Corona (Modelo)", amount: 2500.00, category: "Bebidas", date: "2026-07-10T14:00:00" },
];

const initialAbonos: Abono[] = [
  { id: "a1", clientName: "Felipe Soto (Fiado)", amount: 500.00, date: "2026-07-10T13:15:00" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [insumos, setInsumos] = useState<Insumo[]>(initialInsumos);
  const [userRole, setUserRole] = useState<UserRole>("administrador");
  const [userName, setUserName] = useState("Admin");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("pulpazo-theme") as "light" | "dark") || "dark";
  });
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos);
  const [abonos, setAbonos] = useState<Abono[]>(initialAbonos);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata;
        if (meta?.role) setUserRole(meta.role as UserRole);
        if (meta?.full_name) setUserName(meta.full_name);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata;
          if (meta?.role) setUserRole(meta.role as UserRole);
          if (meta?.full_name) setUserName(meta.full_name);
        } else {
          setUserRole("administrador");
          setUserName("Admin");
        }
      });

      return () => subscription.unsubscribe();
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function loadAll() {
      const [dbDishes, dbTables, dbOrders, dbInsumos, dbClientes, dbGastos, dbAbonos] = await Promise.all([
        db.fetchDishes(),
        db.fetchTables(),
        db.fetchOrders(),
        db.fetchInsumos(),
        db.fetchClientes(),
        db.fetchGastos(),
        db.fetchAbonos(),
      ]);

      if (dbDishes.length > 0) setDishes(dbDishes);
      if (dbTables.length > 0) setTables(dbTables);
      if (dbOrders.length > 0) setOrders(dbOrders);
      if (dbInsumos.length > 0) setInsumos(dbInsumos);
      if (dbClientes.length > 0) setClientes(dbClientes);
      if (dbGastos.length > 0) setGastos(dbGastos);
      if (dbAbonos.length > 0) setAbonos(dbAbonos);

      setLoaded(true);
    }
    loadAll();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem("pulpazo-theme", theme);
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) =>
    setCartItems((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, delta: number) =>
    setCartItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
    );

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const placeOrder = (paymentMethod: string, table?: string) => {
    placeOrderDetailed({
      paymentMethod,
      table,
      orderType: table ? "local" : "llevar",
    });
  };

  const placeOrderDetailed = (params: {
    paymentMethod: string;
    table?: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: "local" | "llevar" | "uber" | "rappi";
  }) => {
    if (cartItems.length === 0) return;
    const order: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: cartTotal,
      paymentMethod: params.paymentMethod,
      status: "pendiente",
      table: params.table,
      clientName: params.clientName,
      clientPhone: params.clientPhone,
      clientAddress: params.clientAddress,
      notes: params.notes,
      orderType: params.orderType,
    };

    const newOrders = [order, ...orders];
    setOrders(newOrders);
    db.saveOrder(order);

    if (params.table && params.orderType === "local") {
      const newTables = tables.map((t) =>
        t.id === params.table ? { ...t, status: "ocupado" as const, time: "00:01 h" } : t
      );
      setTables(newTables);
      const updatedTable = newTables.find((t) => t.id === params.table);
      if (updatedTable) db.saveTable(updatedTable);
    }

    clearCart();
  };

  const addDish = (dish: Omit<Dish, "id" | "recommended">) => {
    const newDish: Dish = {
      ...dish,
      id: String(Date.now()),
      recommended: false,
    };
    const newDishes = [...dishes, newDish];
    setDishes(newDishes);
    db.saveDish(newDish);
  };

  const updateDish = (id: string, updatedFields: Partial<Dish>) => {
    const newDishes = dishes.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
    setDishes(newDishes);
    const updated = newDishes.find((d) => d.id === id);
    if (updated) db.saveDish(updated);
  };

  const removeDish = (id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
    db.deleteDish(id);
  };

  const toggleAvailable = (id: string) => {
    const newDishes = dishes.map((d) => (d.id === id ? { ...d, available: !d.available } : d));
    setDishes(newDishes);
    const updated = newDishes.find((d) => d.id === id);
    if (updated) db.saveDish(updated);
  };

  const toggleRecommended = (id: string) => {
    const newDishes = dishes.map((d) => (d.id === id ? { ...d, recommended: !d.recommended } : d));
    setDishes(newDishes);
    const updated = newDishes.find((d) => d.id === id);
    if (updated) db.saveDish(updated);
  };

  const addTable = (table: Omit<Table, "status">) => {
    const newTable: Table = { ...table, status: "libre" };
    const newTables = [...tables, newTable];
    setTables(newTables);
    db.saveTable(newTable);
  };

  const updateTable = (id: string, updatedFields: Partial<Table>) => {
    const newTables = tables.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setTables(newTables);
    const updated = newTables.find((t) => t.id === id);
    if (updated) db.saveTable(updated);
  };

  const removeTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    db.deleteTable(id);
  };

  const addInsumo = (insumo: Omit<Insumo, "id">) => {
    const newInsumo: Insumo = {
      ...insumo,
      id: `i${Date.now()}`,
    };
    const newInsumos = [...insumos, newInsumo];
    setInsumos(newInsumos);
    db.saveInsumo(newInsumo);
  };

  const updateInsumo = (id: string, updatedFields: Partial<Insumo>) => {
    const newInsumos = insumos.map((i) => (i.id === id ? { ...i, ...updatedFields } : i));
    setInsumos(newInsumos);
    const updated = newInsumos.find((i) => i.id === id);
    if (updated) db.saveInsumo(updated);
  };

  const removeInsumo = (id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
    db.deleteInsumo(id);
  };

  const addCliente = (cliente: Omit<Cliente, "id">) => {
    const newCliente: Cliente = {
      ...cliente,
      id: `c${Date.now()}`,
    };
    const newClientes = [...clientes, newCliente];
    setClientes(newClientes);
    db.saveCliente(newCliente);
  };

  const updateCliente = (id: string, updatedFields: Partial<Cliente>) => {
    const newClientes = clientes.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setClientes(newClientes);
    const updated = newClientes.find((c) => c.id === id);
    if (updated) db.saveCliente(updated);
  };

  const addGasto = (gasto: Omit<Gasto, "id" | "date">) => {
    const newGasto: Gasto = {
      ...gasto,
      id: `g${Date.now()}`,
      date: new Date().toISOString(),
    };
    const newGastos = [...gastos, newGasto];
    setGastos(newGastos);
    db.saveGasto(newGasto);
  };

  const addAbono = (abono: Omit<Abono, "id" | "date">) => {
    const newAbono: Abono = {
      ...abono,
      id: `a${Date.now()}`,
      date: new Date().toISOString(),
    };
    const newAbonos = [...abonos, newAbono];
    setAbonos(newAbonos);
    db.saveAbono(newAbono);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUserRole("administrador");
    setUserName("Admin");
  };

  return (
    <AppContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        orders,
        setOrders,
        placeOrder,
        placeOrderDetailed,
        dishes,
        setDishes,
        addDish,
        updateDish,
        removeDish,
        toggleAvailable,
        toggleRecommended,
        tables,
        setTables,
        addTable,
        updateTable,
        removeTable,
        insumos,
        setInsumos,
        addInsumo,
        updateInsumo,
        removeInsumo,
        userRole,
        setUserRole,
        theme,
        setTheme,
        clientes,
        addCliente,
        updateCliente,
        gastos,
        addGasto,
        abonos,
        addAbono,
        userName,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
