import { useState, useMemo, useEffect } from "react";
import {
  Clock, CheckCircle2, XCircle, ChefHat, UtensilsCrossed,
  AlertTriangle, ArrowRight, Filter, Store, Truck, Smartphone,
} from "lucide-react";
import { useApp, Order } from "../context/AppContext";

type OrderStatus = Order["status"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pendiente: { label: "Pendiente", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  en_preparacion: { label: "En Preparación", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  listo: { label: "Listo para Entregar", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  completado: { label: "Completado", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20" },
  cancelado: { label: "Cancelado", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
};

const ORDER_TYPE_ICONS: Record<string, typeof Store> = {
  local: Store,
  llevar: UtensilsCrossed,
  domicilio: Truck,
  uber: Smartphone,
  rappi: Smartphone,
};

function getTimeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
}

function getUrgencyColor(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins > 20) return "text-red-400";
  if (mins > 10) return "text-amber-400";
  return "text-green-400";
}

export default function Cocina() {
  const { orders, updateOrderStatus, tables, dishes, userRole } = useApp();
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("all");
  const [, setTick] = useState(0);

  // Role restriction: only administrador and cocina can access
  if (userRole !== "administrador" && userRole !== "cocina") {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <ChefHat className="w-12 h-12 text-gray-600 mx-auto" />
          <p className="text-gray-400 text-sm">Acceso restringido a personal de cocina y administradores.</p>
        </div>
      </div>
    );
  }

  // Auto-refresh every 30s for timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = useMemo(() =>
    orders.filter(o => o.date.slice(0, 10) === today)
  , [orders, today]);

  const filteredOrders = useMemo(() => {
    if (orderTypeFilter === "all") return todayOrders;
    return todayOrders.filter(o => o.orderType === orderTypeFilter);
  }, [todayOrders, orderTypeFilter]);

  const pendientes = useMemo(() =>
    filteredOrders.filter(o => o.status === "pendiente")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  , [filteredOrders]);

  const enPreparacion = useMemo(() =>
    filteredOrders.filter(o => o.status === "en_preparacion")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  , [filteredOrders]);

  const listos = useMemo(() =>
    filteredOrders.filter(o => o.status === "listo")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  , [filteredOrders]);

  const getTableName = (tableId?: string) => {
    if (!tableId) return "";
    return tables.find(t => t.id === tableId)?.name || tableId;
  };

  const getDishNames = (items: Order["items"]) =>
    items.map(i => `${i.quantity}x ${i.name}`).join(", ");

  const OrderCard = ({ order, nextStatus, nextLabel, nextColor }: {
    order: Order;
    nextStatus: OrderStatus;
    nextLabel: string;
    nextColor: string;
  }) => {
    const TypeIcon = ORDER_TYPE_ICONS[order.orderType] || Store;
    const timeColor = getUrgencyColor(order.date);
    const timeSince = getTimeSince(order.date);

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TypeIcon className="w-4 h-4 text-amber-400" />
            {order.table && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-xs font-bold">
                {getTableName(order.table)}
              </span>
            )}
            <span className="text-gray-500 text-xs">
              #{order.id.slice(-6)}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${timeColor}`}>
            <Clock className="w-3 h-3" />
            <span className="text-xs font-mono font-bold">{timeSince}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5 mb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-white font-medium">
                <span className="text-amber-400 font-bold">{item.quantity}x</span> {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2 mb-3">
            <p className="text-amber-400 text-xs italic">"{order.notes}"</p>
          </div>
        )}

        {/* Client info for delivery */}
        {(order.orderType === "domicilio" || order.orderType === "uber" || order.orderType === "rappi") && (
          <div className="text-gray-500 text-xs mb-3">
            {order.clientName && <span>{order.clientName}</span>}
            {order.clientAddress && <span className="ml-2">· {order.clientAddress}</span>}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={() => updateOrderStatus(order.id, nextStatus)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${nextColor}`}
        >
          <ArrowRight className="w-3.5 h-3.5" /> {nextLabel}
        </button>
      </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-auto bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cocina</h1>
              <p className="text-gray-400 text-xs">
                {pendientes.length + enPreparacion.length + listos.length} pedidos activos
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="local">Local</option>
              <option value="llevar">Llevar</option>
              <option value="domicilio">Domicilio</option>
              <option value="uber">Uber</option>
              <option value="rappi">Rappi</option>
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pendientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Pendientes</h2>
              </div>
              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-bold">
                {pendientes.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {pendientes.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Sin pedidos pendientes</p>
                </div>
              ) : (
                pendientes.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    nextStatus="en_preparacion"
                    nextLabel="Enviar a Cocina"
                    nextColor="bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:bg-blue-500/30"
                  />
                ))
              )}
            </div>
          </div>

          {/* En Preparación */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider">En Preparación</h2>
              </div>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold">
                {enPreparacion.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {enPreparacion.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Sin pedidos en cocina</p>
                </div>
              ) : (
                enPreparacion.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    nextStatus="listo"
                    nextLabel="Marcar Listo"
                    nextColor="bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:bg-amber-500/30"
                  />
                ))
              )}
            </div>
          </div>

          {/* Listos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider">Listos</h2>
              </div>
              <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-bold">
                {listos.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px]">
              {listos.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Sin pedidos listos</p>
                </div>
              ) : (
                listos.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    nextStatus="completado"
                    nextLabel="Entregado"
                    nextColor="bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
