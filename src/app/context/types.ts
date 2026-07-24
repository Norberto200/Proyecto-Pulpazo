export type DishCategory = "Entradas" | "Platos Fuertes" | "Bebidas" | "Postres";

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: DishCategory;
  available: boolean;
  recommended: boolean;
  image: string;
}

export interface DishIngredient {
  id: string;
  dishId: string;
  insumoId: string;
  cantidad: number;
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
  subtotal: number;
  iva: number;
  totalConIva: number;
  paymentMethod: string;
  status: "completado" | "pendiente" | "cancelado" | "en_preparacion" | "listo";
  table?: string;
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  notes?: string;
  orderType: "local" | "llevar" | "domicilio" | "uber" | "rappi";
  descuento?: number;
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

export type UserRole = "administrador" | "cajera" | "mesero" | "cocina";

export interface Cliente {
  id: string;
  name: string;
  phone: string;
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  colony: string;
  postalCode: string;
  reference: string;
  defaultPayment: "Efectivo" | "Tarjeta de Crédito/Débito";
  notes: string;
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

export interface Promotor {
  id: string;
  name: string;
  brand: string;
  contact: string;
  phone: string;
  type: "Coca-Cola" | "Pepsi" | "Pescaderia" | "Cerveceria" | "Otro";
  notes: string;
  active: boolean;
  dateAdded: string;
}

export interface Entrega {
  id: string;
  promotorId: string;
  type: "recepcion" | "envio";
  description: string;
  quantity: string;
  date: string;
  time: string;
  status: "pendiente" | "en_camino" | "entregado" | "cancelado";
  address?: string;
  notes?: string;
}

export interface CorteSummary {
  efectivo: number;
  tarjeta: number;
  plataformas: number;
  gastos: number;
  abonos: number;
  totalVentas: number;
  cajaInicial: number;
  efectivoEnCaja: number;
}

export interface CorteRecord {
  id: string;
  type: "medio" | "final";
  date: string;
  cashCounted: number;
  expectedCash: number;
  difference: number;
  summary: CorteSummary;
}

export type RepartidorVehiculo = "bicicleta" | "moto" | "auto" | "a_pie";
export type RepartidorEstatus = "disponible" | "en_entrega" | "descanso" | "inactivo";

export interface Repartidor {
  id: string;
  nombre: string;
  telefono: string;
  vehiculo: RepartidorVehiculo;
  estatus: RepartidorEstatus;
  activo: boolean;
  notas: string;
  fechaRegistro: string;
}

export type EntregaRepartidorEstatus = "asignado" | "recogido" | "en_camino" | "entregado" | "cancelado";

export interface EntregaRepartidor {
  id: string;
  repartidorId: string;
  orderId: string;
  estatus: EntregaRepartidorEstatus;
  fecha: string;
  hora: string;
  direccion: string;
  notas: string;
}

export type DescuentoTipo = "porcentaje" | "monto_fijo";

export interface Descuento {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: DescuentoTipo;
  valor: number;
  minPedido: number;
  activo: boolean;
  validoDesde: string;
  validoHasta: string;
  usosMaximos: number;
  usosActuales: number;
  creadoEn: string;
}

export type NotificacionTipo = "stock_bajo" | "pedido_listo" | "pedido_cancelado" | "sistema";

export interface Notificacion {
  id: string;
  tipo: NotificacionTipo;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
  metadata?: string;
}
