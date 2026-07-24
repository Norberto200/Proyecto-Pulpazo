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
  CorteRecord,
  Promotor,
  Entrega,
  Repartidor,
  EntregaRepartidor,
  DishIngredient,
  Descuento,
  Notificacion,
} from "../app/context/AppContext";

type DBRow = Record<string, unknown>;

function rowToDish(r: DBRow): Dish {
  return {
    id: String(r.id),
    name: String(r.nombre),
    description: String(r.descripcion ?? ""),
    price: Number(r.precio),
    cost: Number(r.costo ?? 0),
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
    costo: d.cost,
    categoria: d.category,
    disponible: d.available,
    recomendado: d.recomendado,
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
    items: typeof r.items === "string" ? JSON.parse(r.items) : (Array.isArray(r.items) ? (r.items as CartItem[]) : []),
    total: Number(r.total),
    subtotal: Number(r.subtotal ?? r.total),
    iva: Number(r.iva ?? 0),
    totalConIva: Number(r.total_con_iva ?? r.total),
    paymentMethod: String(r.metodo_pago),
    status: String(r.estado) as Order["status"],
    table: r.mesa != null ? String(r.mesa) : undefined,
    clientName: r.nombre_cliente != null ? String(r.nombre_cliente) : undefined,
    clientPhone: r.telefono_cliente != null ? String(r.telefono_cliente) : undefined,
    clientAddress: r.direccion_cliente != null ? String(r.direccion_cliente) : undefined,
    notes: r.notas != null ? String(r.notas) : undefined,
    orderType: String(r.tipo_pedido) as Order["orderType"],
    descuento: r.descuento != null ? Number(r.descuento) : undefined,
  };
}

function orderToRow(o: Order): DBRow {
  return {
    id: o.id,
    fecha: o.date,
    items: JSON.stringify(o.items),
    total: o.total,
    subtotal: o.subtotal,
    iva: o.iva,
    total_con_iva: o.totalConIva,
    metodo_pago: o.paymentMethod,
    estado: o.status,
    mesa: o.table ?? null,
    nombre_cliente: o.clientName ?? null,
    telefono_cliente: o.clientPhone ?? null,
    direccion_cliente: o.clientAddress ?? null,
    notas: o.notes ?? null,
    tipo_pedido: o.orderType,
    descuento: o.descuento ?? null,
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
    street: String(r.calle ?? ""),
    number: String(r.numero ?? ""),
    neighborhood: String(r.colonia ?? ""),
    colony: String(r.fraccionamiento ?? ""),
    postalCode: String(r.codigo_postal ?? ""),
    reference: String(r.referencia ?? ""),
    defaultPayment: String(r.metodo_pago_default ?? "Efectivo") as Cliente["defaultPayment"],
    notes: String(r.notas ?? ""),
  };
}

function clienteToRow(c: Cliente): DBRow {
  return {
    id: c.id,
    nombre: c.name,
    telefono: c.phone,
    direccion: c.address,
    calle: c.street,
    numero: c.number,
    colonia: c.neighborhood,
    fraccionamiento: c.colony,
    codigo_postal: c.postalCode,
    referencia: c.reference,
    metodo_pago_default: c.defaultPayment,
    notas: c.notes,
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

function rowToCorte(r: DBRow): CorteRecord {
  const summary = typeof r.resumen === "string" ? JSON.parse(r.resumen) : (r.resumen ?? {});
  return {
    id: String(r.id),
    type: String(r.tipo) as CorteRecord["type"],
    date: String(r.fecha),
    cashCounted: Number(r.efectivo_contado),
    expectedCash: Number(r.efectivo_esperado),
    difference: Number(r.diferencia),
    summary: {
      efectivo: Number(summary.efectivo ?? 0),
      tarjeta: Number(summary.tarjeta ?? 0),
      plataformas: Number(summary.plataformas ?? 0),
      gastos: Number(summary.gastos ?? 0),
      abonos: Number(summary.abonos ?? 0),
      totalVentas: Number(summary.totalVentas ?? 0),
      cajaInicial: Number(summary.cajaInicial ?? 0),
      efectivoEnCaja: Number(summary.efectivoEnCaja ?? 0),
    },
  };
}

function corteToRow(c: CorteRecord): DBRow {
  return {
    id: c.id,
    tipo: c.type,
    fecha: c.date,
    efectivo_contado: c.cashCounted,
    efectivo_esperado: c.expectedCash,
    diferencia: c.difference,
    resumen: JSON.stringify(c.summary),
  };
}

function rowToPromotor(r: DBRow): Promotor {
  return {
    id: String(r.id),
    name: String(r.nombre),
    brand: String(r.marca),
    contact: String(r.contacto ?? ""),
    phone: String(r.telefono ?? ""),
    type: String(r.tipo) as Promotor["type"],
    notes: String(r.notas ?? ""),
    active: Boolean(r.activo),
    dateAdded: String(r.fecha_agregado),
  };
}

function promotorToRow(p: Promotor): DBRow {
  return {
    id: p.id,
    nombre: p.name,
    marca: p.brand,
    contacto: p.contact,
    telefono: p.phone,
    tipo: p.type,
    notas: p.notes,
    activo: p.active,
    fecha_agregado: p.dateAdded,
  };
}

function rowToEntrega(r: DBRow): Entrega {
  return {
    id: String(r.id),
    promotorId: String(r.promotor_id),
    type: String(r.tipo) as Entrega["type"],
    description: String(r.descripcion),
    quantity: String(r.cantidad ?? ""),
    date: String(r.fecha),
    time: String(r.hora),
    status: String(r.estado) as Entrega["status"],
    address: r.direccion != null ? String(r.direccion) : undefined,
    notes: r.notas != null ? String(r.notas) : undefined,
  };
}

function entregaToRow(e: Entrega): DBRow {
  return {
    id: e.id,
    promotor_id: e.promotorId,
    tipo: e.type,
    descripcion: e.description,
    cantidad: e.quantity,
    fecha: e.date,
    hora: e.time,
    estado: e.status,
    direccion: e.address ?? null,
    notas: e.notes ?? null,
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

function rowToRepartidor(r: DBRow): Repartidor {
  return {
    id: String(r.id),
    nombre: String(r.nombre ?? ""),
    telefono: String(r.telefono ?? ""),
    vehiculo: String(r.vehiculo ?? "moto") as Repartidor["vehiculo"],
    estatus: String(r.estatus ?? "disponible") as Repartidor["estatus"],
    activo: Boolean(r.activo ?? true),
    notas: String(r.notas ?? ""),
    fechaRegistro: String(r.fecha_registro ?? ""),
  };
}

function repartidorToRow(rp: Repartidor): DBRow {
  return {
    id: rp.id,
    nombre: rp.nombre,
    telefono: rp.telefono,
    vehiculo: rp.vehiculo,
    estatus: rp.estatus,
    activo: rp.activo,
    notas: rp.notas,
    fecha_registro: rp.fechaRegistro,
  };
}

function rowToEntregaRepartidor(r: DBRow): EntregaRepartidor {
  return {
    id: String(r.id),
    repartidorId: String(r.repartidor_id ?? ""),
    orderId: String(r.order_id ?? ""),
    estatus: String(r.estatus ?? "asignado") as EntregaRepartidor["estatus"],
    fecha: String(r.fecha ?? ""),
    hora: String(r.hora ?? ""),
    direccion: String(r.direccion ?? ""),
    notas: String(r.notas ?? ""),
  };
}

function entregaRepartidorToRow(e: EntregaRepartidor): DBRow {
  return {
    id: e.id,
    repartidor_id: e.repartidorId,
    order_id: e.orderId,
    estatus: e.estatus,
    fecha: e.fecha,
    hora: e.hora,
    direccion: e.direccion,
    notas: e.notas,
  };
}

function rowToDishIngredient(r: DBRow): DishIngredient {
  return {
    id: String(r.id),
    dishId: String(r.dish_id),
    insumoId: String(r.insumo_id),
    cantidad: Number(r.cantidad),
  };
}

function dishIngredientToRow(di: DishIngredient): DBRow {
  return {
    id: di.id,
    dish_id: di.dishId,
    insumo_id: di.insumoId,
    cantidad: di.cantidad,
  };
}

function rowToDescuento(r: DBRow): Descuento {
  return {
    id: String(r.id),
    codigo: String(r.codigo),
    descripcion: String(r.descripcion ?? ""),
    tipo: String(r.tipo) as Descuento["tipo"],
    valor: Number(r.valor),
    minPedido: Number(r.min_pedido),
    activo: Boolean(r.activo),
    validoDesde: String(r.valido_desde ?? ""),
    validoHasta: String(r.valido_hasta ?? ""),
    usosMaximos: Number(r.usos_maximos),
    usosActuales: Number(r.usos_actuales),
    creadoEn: String(r.creado_en ?? ""),
  };
}

function descuentoToRow(d: Descuento): DBRow {
  return {
    id: d.id,
    codigo: d.codigo,
    descripcion: d.descripcion,
    tipo: d.tipo,
    valor: d.valor,
    min_pedido: d.minPedido,
    activo: d.activo,
    valido_desde: d.validoDesde,
    valido_hasta: d.validoHasta,
    usos_maximos: d.usosMaximos,
    usos_actuales: d.usosActuales,
    creado_en: d.creadoEn,
  };
}

function rowToNotificacion(r: DBRow): Notificacion {
  return {
    id: String(r.id),
    tipo: String(r.tipo) as Notificacion["tipo"],
    titulo: String(r.titulo),
    mensaje: String(r.mensaje),
    leida: Boolean(r.leida),
    fecha: String(r.fecha),
    metadata: r.metadata != null ? String(r.metadata) : undefined,
  };
}

function notificacionToRow(n: Notificacion): DBRow {
  return {
    id: n.id,
    tipo: n.tipo,
    titulo: n.titulo,
    mensaje: n.mensaje,
    leida: n.leida,
    fecha: n.fecha,
    metadata: n.metadata ?? null,
  };
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
  deleteCliente: (id: string) => remove("app_clientes", id),

  // Gastos
  fetchGastos: () => fetchAll("app_gastos", rowToGasto),
  saveGasto: (g: Gasto) => upsert("app_gastos", gastoToRow(g)),
  saveGastos: (items: Gasto[]) => upsertMany("app_gastos", items.map(gastoToRow)),

  // Abonos
  fetchAbonos: () => fetchAll("app_abonos", rowToAbono),
  saveAbono: (a: Abono) => upsert("app_abonos", abonoToRow(a)),
  saveAbonos: (items: Abono[]) => upsertMany("app_abonos", items.map(abonoToRow)),

  // Cortes de Caja
  fetchCortes: () => fetchAll("app_cortes", rowToCorte),
  saveCorte: (c: CorteRecord) => upsert("app_cortes", corteToRow(c)),

  // Promotores
  fetchPromotores: () => fetchAll("app_promotores", rowToPromotor),
  savePromotor: (p: Promotor) => upsert("app_promotores", promotorToRow(p)),
  deletePromotor: (id: string) => remove("app_promotores", id),

  // Entregas
  fetchEntregas: () => fetchAll("app_entregas", rowToEntrega),
  saveEntrega: (e: Entrega) => upsert("app_entregas", entregaToRow(e)),
  deleteEntrega: (id: string) => remove("app_entregas", id),

  // Repartidores
  fetchRepartidores: () => fetchAll("app_repartidores", rowToRepartidor),
  saveRepartidor: (rp: Repartidor) => upsert("app_repartidores", repartidorToRow(rp)),
  deleteRepartidor: (id: string) => remove("app_repartidores", id),

  // Entregas Repartidor
  fetchEntregasRepartidor: () => fetchAll("app_entregas_repartidor", rowToEntregaRepartidor),
  saveEntregaRepartidor: (e: EntregaRepartidor) => upsert("app_entregas_repartidor", entregaRepartidorToRow(e)),
  deleteEntregaRepartidor: (id: string) => remove("app_entregas_repartidor", id),

  // Recetas (DishIngredients)
  fetchRecetas: () => fetchAll("app_recetas", rowToDishIngredient),
  saveReceta: (di: DishIngredient) => upsert("app_recetas", dishIngredientToRow(di)),
  deleteReceta: (id: string) => remove("app_recetas", id),
  saveRecetas: (items: DishIngredient[]) => upsertMany("app_recetas", items.map(dishIngredientToRow)),

  // Descuentos
  fetchDescuentos: () => fetchAll("app_descuentos", rowToDescuento),
  saveDescuento: (d: Descuento) => upsert("app_descuentos", descuentoToRow(d)),
  deleteDescuento: (id: string) => remove("app_descuentos", id),
  saveDescuentos: (items: Descuento[]) => upsertMany("app_descuentos", items.map(descuentoToRow)),

  // Notificaciones
  fetchNotificaciones: () => fetchAll("app_notificaciones", rowToNotificacion),
  saveNotificacion: (n: Notificacion) => upsert("app_notificaciones", notificacionToRow(n)),
  deleteNotificacion: (id: string) => remove("app_notificaciones", id),
};
