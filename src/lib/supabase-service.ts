import { supabase } from "./supabase";
import type {
  Dish,
  Order,
  Table,
  Insumo,
  Cliente,
  Gasto,
  Abono,
  CartItem,
} from "../app/context/AppContext";

type DBRow = Record<string, unknown>;

function rowToDish(r: DBRow): Dish {
  return {
    id: String(r.id),
    name: String(r.nombre),
    description: String(r.descripcion ?? ""),
    price: Number(r.precio),
    category: String(r.categoria) as Dish["category"],
    available: Boolean(r.disponible),
    recommended: Boolean(r.recomendado),
    image: String(r.imagen ?? ""),
  };
}

function dishToRow(d: Dish): DBRow {
  return {
    id: d.id,
    nombre: d.name,
    descripcion: d.description,
    precio: d.price,
    categoria: d.category,
    disponible: d.available,
    recomendado: d.recommended,
    imagen: d.image,
  };
}

function rowToTable(r: DBRow): Table {
  return {
    id: String(r.id),
    name: String(r.nombre),
    type: String(r.tipo) as Table["type"],
    status: String(r.estado) as Table["status"],
    x: Number(r.pos_x),
    y: Number(r.pos_y),
    width: r.ancho != null ? Number(r.ancho) : undefined,
    height: r.alto != null ? Number(r.alto) : undefined,
    radius: r.radio != null ? Number(r.radio) : undefined,
    rotation: r.rotacion != null ? Number(r.rotacion) : undefined,
    time: r.tiempo != null ? String(r.tiempo) : undefined,
  };
}

function tableToRow(t: Table): DBRow {
  return {
    id: t.id,
    nombre: t.name,
    tipo: t.type,
    estado: t.status,
    pos_x: t.x,
    pos_y: t.y,
    ancho: t.width ?? null,
    alto: t.height ?? null,
    radio: t.radius ?? null,
    rotacion: t.rotation ?? null,
    tiempo: t.time ?? null,
  };
}

function rowToOrder(r: DBRow): Order {
  return {
    id: String(r.id),
    date: String(r.fecha),
    items: (r.items as CartItem[]) ?? [],
    total: Number(r.total),
    paymentMethod: String(r.metodo_pago),
    status: String(r.estado) as Order["status"],
    table: r.mesa != null ? String(r.mesa) : undefined,
    clientName: r.nombre_cliente != null ? String(r.nombre_cliente) : undefined,
    clientPhone: r.telefono_cliente != null ? String(r.telefono_cliente) : undefined,
    clientAddress: r.direccion_cliente != null ? String(r.direccion_cliente) : undefined,
    notes: r.notas != null ? String(r.notas) : undefined,
    orderType: String(r.tipo_pedido) as Order["orderType"],
  };
}

function orderToRow(o: Order): DBRow {
  return {
    id: o.id,
    fecha: o.date,
    items: JSON.stringify(o.items),
    total: o.total,
    metodo_pago: o.paymentMethod,
    estado: o.status,
    mesa: o.table ?? null,
    nombre_cliente: o.clientName ?? null,
    telefono_cliente: o.clientPhone ?? null,
    direccion_cliente: o.clientAddress ?? null,
    notas: o.notes ?? null,
    tipo_pedido: o.orderType,
  };
}

function rowToInsumo(r: DBRow): Insumo {
  return {
    id: String(r.id),
    name: String(r.nombre),
    stockActual: Number(r.stock_actual),
    stockMinimo: Number(r.stock_minimo),
    unit: String(r.unidad),
  };
}

function insumoToRow(i: Insumo): DBRow {
  return {
    id: i.id,
    nombre: i.name,
    stock_actual: i.stockActual,
    stock_minimo: i.stockMinimo,
    unidad: i.unit,
  };
}

function rowToCliente(r: DBRow): Cliente {
  return {
    id: String(r.id),
    name: String(r.nombre),
    phone: String(r.telefono ?? ""),
    address: String(r.direccion ?? ""),
  };
}

function clienteToRow(c: Cliente): DBRow {
  return {
    id: c.id,
    nombre: c.name,
    telefono: c.phone,
    direccion: c.address,
  };
}

function rowToGasto(r: DBRow): Gasto {
  return {
    id: String(r.id),
    description: String(r.descripcion),
    amount: Number(r.monto),
    category: String(r.categoria),
    date: String(r.fecha),
  };
}

function gastoToRow(g: Gasto): DBRow {
  return {
    id: g.id,
    descripcion: g.description,
    monto: g.amount,
    categoria: g.category,
    fecha: g.date,
  };
}

function rowToAbono(r: DBRow): Abono {
  return {
    id: String(r.id),
    clientName: String(r.nombre_cliente),
    amount: Number(r.monto),
    date: String(r.fecha),
  };
}

function abonoToRow(a: Abono): DBRow {
  return {
    id: a.id,
    nombre_cliente: a.clientName,
    monto: a.amount,
    fecha: a.date,
  };
}

async function fetchAll<T>(table: string, mapper: (r: DBRow) => T): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`Error fetching ${table}:`, error.message);
    return [];
  }
  return (data ?? []).map(mapper);
}

async function upsert(table: string, row: DBRow): Promise<void> {
  const { error } = await supabase.from(table).upsert(row, { onConflict: "id" });
  if (error) console.warn(`Error upserting ${table}:`, error.message);
}

async function remove(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) console.warn(`Error deleting ${table}:`, error.message);
}

async function upsertMany(table: string, rows: DBRow[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) console.warn(`Error bulk upsert ${table}:`, error.message);
}

export const db = {
  // Dishes
  fetchDishes: () => fetchAll("app_platillos", rowToDish),
  saveDish: (d: Dish) => upsert("app_platillos", dishToRow(d)),
  deleteDish: (id: string) => remove("app_platillos", id),
  saveDishes: (items: Dish[]) => upsertMany("app_platillos", items.map(dishToRow)),

  // Tables
  fetchTables: () => fetchAll("app_mesas", rowToTable),
  saveTable: (t: Table) => upsert("app_mesas", tableToRow(t)),
  deleteTable: (id: string) => remove("app_mesas", id),
  saveTables: (items: Table[]) => upsertMany("app_mesas", items.map(tableToRow)),

  // Orders
  fetchOrders: () => fetchAll("app_pedidos", rowToOrder),
  saveOrder: (o: Order) => upsert("app_pedidos", orderToRow(o)),
  deleteOrder: (id: string) => remove("app_pedidos", id),
  saveOrders: (items: Order[]) => upsertMany("app_pedidos", items.map(orderToRow)),

  // Insumos
  fetchInsumos: () => fetchAll("app_insumos", rowToInsumo),
  saveInsumo: (i: Insumo) => upsert("app_insumos", insumoToRow(i)),
  deleteInsumo: (id: string) => remove("app_insumos", id),
  saveInsumos: (items: Insumo[]) => upsertMany("app_insumos", items.map(insumoToRow)),

  // Clientes
  fetchClientes: () => fetchAll("app_clientes", rowToCliente),
  saveCliente: (c: Cliente) => upsert("app_clientes", clienteToRow(c)),
  saveClientes: (items: Cliente[]) => upsertMany("app_clientes", items.map(clienteToRow)),

  // Gastos
  fetchGastos: () => fetchAll("app_gastos", rowToGasto),
  saveGasto: (g: Gasto) => upsert("app_gastos", gastoToRow(g)),
  saveGastos: (items: Gasto[]) => upsertMany("app_gastos", items.map(gastoToRow)),

  // Abonos
  fetchAbonos: () => fetchAll("app_abonos", rowToAbono),
  saveAbono: (a: Abono) => upsert("app_abonos", abonoToRow(a)),
  saveAbonos: (items: Abono[]) => upsertMany("app_abonos", items.map(abonoToRow)),
};
