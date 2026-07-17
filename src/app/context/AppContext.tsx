import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  placeOrder: (paymentMethod: string, table?: string) => void;
  dishes: Dish[];
  addDish: (dish: Omit<Dish, "id" | "recommended">) => void;
  updateDish: (id: string, updatedFields: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  toggleAvailable: (id: string) => void;
  toggleRecommended: (id: string) => void;
  tables: Table[];
  addTable: (table: Omit<Table, "status">) => void;
  updateTable: (id: string, updatedFields: Partial<Table>) => void;
  removeTable: (id: string) => void;
  insumos: Insumo[];
  addInsumo: (insumo: Omit<Insumo, "id">) => void;
  updateInsumo: (id: string, updatedFields: Partial<Insumo>) => void;
  removeInsumo: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const CATEGORY_MAP: Record<string, DishCategory> = {
  "Entradas": "Entradas",
  "Ceviches": "Entradas",
  "Cocteles": "Bebidas",
  "Tacos": "Platos Fuertes",
  "Filetes": "Platos Fuertes",
  "Camarones": "Platos Fuertes",
  "Pulpo": "Platos Fuertes",
  "Bebidas": "Bebidas",
  "Postres": "Postres",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop";

function mapProductToDish(p: any): Dish {
  return {
    id: String(p.idproducto),
    name: p.nombre,
    description: p.descripcion || "",
    price: Number(p.precio),
    category: CATEGORY_MAP[p.categorias?.nombre] || "Platos Fuertes",
    available: p.disponible,
    recommended: false,
    image: p.imagen || DEFAULT_IMAGE,
  };
}

function mapMesaToTable(m: any, index: number): Table {
  const statusMap: Record<string, TableStatus> = {
    LIBRE: "libre",
    OCUPADA: "ocupado",
    RESERVADA: "reservado",
  };
  const cols = 4;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const isCircular = m.codigomesa.startsWith("B") || m.codigomesa.startsWith("D");

  return {
    id: String(m.idmesa),
    name: m.codigomesa,
    type: isCircular ? "circular" : "rectangular",
    status: statusMap[m.estado] || "libre",
    x: isCircular ? 85 + col * 100 : 50 + col * 100,
    y: 80 + row * 100,
    ...(isCircular
      ? { radius: 30 }
      : { width: 80, height: 40 }),
  };
}

function mapIngredienteToInsumo(i: any): Insumo {
  return {
    id: String(i.idingrediente),
    name: i.nombre,
    stockActual: Number(i.stockactual),
    stockMinimo: Number(i.stockminimo),
    unit: i.unidad,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [prodRes, mesasRes, ingRes, pedRes] = await Promise.all([
      supabase.from("productos").select("*, categorias(nombre)"),
      supabase.from("mesas").select("*").order("codigomesa"),
      supabase.from("ingredientes").select("*").eq("activo", true),
      supabase.from("pedidos").select("*, detallepedidos(*, productos(nombre, precio, imagen)), mesas(codigomesa), pagos(metodospago(nombre))").order("fechapedido", { ascending: false }),
    ]);

    if (prodRes.data) setDishes(prodRes.data.map(mapProductToDish));
    if (mesasRes.data) setTables(mesasRes.data.map((m, i) => mapMesaToTable(m, i)));
    if (ingRes.data) setInsumos(ingRes.data.map(mapIngredienteToInsumo));
    if (pedRes.data) {
      setOrders(pedRes.data.map((p: any) => ({
        id: `ORD-${String(p.idpedido).padStart(3, "0")}`,
        date: p.fechapedido,
        items: (p.detallepedidos || []).map((d: any) => ({
          id: String(d.idproducto),
          name: d.productos?.nombre || "",
          price: Number(d.precioUnitario),
          quantity: d.cantidad,
          image: d.productos?.imagen || DEFAULT_IMAGE,
          category: "",
        })),
        total: Number(p.total),
        paymentMethod: p.pagos?.[0]?.metodospago?.nombre || "Efectivo",
        status: p.estado === "Completado" ? "completado" : p.estado === "Pendiente" ? "pendiente" : "cancelado",
        table: p.mesas?.codigomesa,
      })));
    }
  }

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

  const placeOrder = async (paymentMethod: string, table?: string) => {
    if (cartItems.length === 0) return;

    const mesa = tables.find((t) => t.name === table);
    const metodoRes = await supabase.from("metodospago").select("idmetodopago").eq("nombre", paymentMethod).single();

    const { data: pedido } = await supabase
      .from("pedidos")
      .insert({
        idmesa: mesa ? Number(mesa.id) : null,
        idusuario: 1,
        estado: "Completado",
        total: cartTotal,
      })
      .select()
      .single();

    if (pedido) {
      const detalles = cartItems.map((item) => ({
        idpedido: pedido.idpedido,
        idproducto: Number(item.id),
        cantidad: item.quantity,
        preciounitario: item.price,
      }));
      await supabase.from("detallepedidos").insert(detalles);

      if (metodoRes.data) {
        await supabase.from("pagos").insert({
          idpedido: pedido.idpedido,
          idmetodopago: metodoRes.data.idmetodopago,
          monto: cartTotal,
        });
      }

      if (mesa) {
        await supabase.from("mesas").update({ estado: "LIBRE" }).eq("idmesa", Number(mesa.id));
      }
    }

    clearCart();
    await fetchAll();
  };

  const addDish = async (dish: Omit<Dish, "id" | "recommended">) => {
    const { data } = await supabase
      .from("productos")
      .insert({
        idcategoria: 1,
        nombre: dish.name,
        descripcion: dish.description,
        precio: dish.price,
        tipoventa: "PIEZA",
        disponible: dish.available,
        imagen: dish.image,
      })
      .select("*, categorias(nombre)")
      .single();

    if (data) setDishes((prev) => [...prev, mapProductToDish(data)]);
  };

  const updateDish = async (id: string, updatedFields: Partial<Dish>) => {
    await supabase
      .from("productos")
      .update({
        nombre: updatedFields.name,
        descripcion: updatedFields.description,
        precio: updatedFields.price,
        disponible: updatedFields.available,
        imagen: updatedFields.image,
      })
      .eq("idproducto", Number(id));

    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)));
  };

  const removeDish = async (id: string) => {
    await supabase.from("productos").delete().eq("idproducto", Number(id));
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleAvailable = async (id: string) => {
    const dish = dishes.find((d) => d.id === id);
    if (!dish) return;
    await supabase.from("productos").update({ disponible: !dish.available }).eq("idproducto", Number(id));
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, available: !d.available } : d)));
  };

  const toggleRecommended = (id: string) => {
    setDishes((prev) => prev.map((d) => (d.id === id ? { ...d, recommended: !d.recommended } : d)));
  };

  const addTable = async (table: Omit<Table, "status">) => {
    const { data } = await supabase
      .from("mesas")
      .insert({
        codigomesa: table.name,
        capacidad: 4,
        estado: "LIBRE",
      })
      .select()
      .single();

    if (data) setTables((prev) => [...prev, mapMesaToTable(data, prev.length)]);
  };

  const updateTable = async (id: string, updatedFields: Partial<Table>) => {
    const statusMap: Record<TableStatus, string> = {
      libre: "LIBRE",
      ocupado: "OCUPADA",
      reservado: "RESERVADA",
    };
    if (updatedFields.status) {
      await supabase.from("mesas").update({ estado: statusMap[updatedFields.status] }).eq("idmesa", Number(id));
    }
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const removeTable = async (id: string) => {
    await supabase.from("mesas").delete().eq("idmesa", Number(id));
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const addInsumo = async (insumo: Omit<Insumo, "id">) => {
    const { data } = await supabase
      .from("ingredientes")
      .insert({
        nombre: insumo.name,
        unidad: insumo.unit,
        stockactual: insumo.stockActual,
        stockminimo: insumo.stockMinimo,
      })
      .select()
      .single();

    if (data) setInsumos((prev) => [...prev, mapIngredienteToInsumo(data)]);
  };

  const updateInsumo = async (id: string, updatedFields: Partial<Insumo>) => {
    await supabase
      .from("ingredientes")
      .update({
        nombre: updatedFields.name,
        stockactual: updatedFields.stockActual,
        stockminimo: updatedFields.stockMinimo,
        unidad: updatedFields.unit,
      })
      .eq("idingrediente", Number(id));

    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, ...updatedFields } : i)));
  };

  const removeInsumo = async (id: string) => {
    await supabase.from("ingredientes").delete().eq("idingrediente", Number(id));
    setInsumos((prev) => prev.filter((i) => i.id !== id));
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
        placeOrder,
        dishes,
        addDish,
        updateDish,
        removeDish,
        toggleAvailable,
        toggleRecommended,
        tables,
        addTable,
        updateTable,
        removeTable,
        insumos,
        addInsumo,
        updateInsumo,
        removeInsumo,
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
