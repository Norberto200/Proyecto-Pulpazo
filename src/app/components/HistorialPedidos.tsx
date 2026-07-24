import { useState } from "react";
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useApp, Order } from "../context/AppContext";

const statusConfig = {
  completado: { label: "Completado", color: "#22c55e", Icon: CheckCircle },
  pendiente:  { label: "Pendiente",  color: "#f97316", Icon: Clock },
  cancelado:  { label: "Cancelado",  color: "#ef4444", Icon: XCircle },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const { label, color, Icon } = statusConfig[order.status];
  const date = new Date(order.date);
  const dateStr = date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-[#111] border border-primary/20 rounded-xl overflow-hidden">
      {/* Header row */}
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-primary/4 transition-colors text-left">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-medium">{order.id}</span>
            {order.table && <span className="text-[10px] text-gray-500 bg-primary/8 px-2 py-0.5 rounded-full">Mesa {order.table}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{dateStr} · {timeStr} · {order.paymentMethod}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" style={{ color }} strokeWidth={1.5} />
            <span className="text-xs" style={{ color }}>{label}</span>
          </div>
          <span className="text-primary font-semibold text-sm">${order.total.toFixed(2)}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
            : <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
          }
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-primary/10 px-5 py-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{item.name}</p>
                <p className="text-gray-500 text-xs">{item.category} · x{item.quantity}</p>
              </div>
              <span className="text-primary text-sm flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-primary/10 pt-3 flex justify-between">
            <span className="text-gray-500 text-xs">IVA incluido (16%)</span>
            <span className="text-primary font-semibold text-sm">Total: ${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

type Filter = "todos" | "completado" | "pendiente" | "cancelado";

export default function HistorialPedidos() {
  const { orders } = useApp();
  const [filter, setFilter] = useState<Filter>("todos");

  const filtered = filter === "todos" ? orders : orders.filter((o) => o.status === filter);
  const totalSpent = orders.filter((o) => o.status === "completado").reduce((s, o) => s + o.total, 0);

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Historial de Pedidos</h1>
            <p className="text-gray-500 text-sm mt-1">{orders.length} pedidos registrados</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total consumido</p>
            <p className="text-primary font-semibold">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {(["completado", "pendiente", "cancelado"] as const).map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            const { label, color } = statusConfig[s];
            return (
              <button key={s} onClick={() => setFilter(filter === s ? "todos" : s)}
                className={`rounded-xl p-4 border text-left transition-all ${
                  filter === s ? "border-primary/50 bg-primary/8" : "border-primary/15 bg-[#111] hover:border-primary/30"
                }`}>
                <p className="text-2xl font-light" style={{ color }}>{count}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </button>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 border-b border-primary/20 mb-6">
          {([["todos","Todos"], ["completado","Completados"], ["pendiente","Pendientes"], ["cancelado","Cancelados"]] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 text-xs tracking-wider border-b-2 -mb-px transition-all ${
                filter === val ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-primary"
              }`}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingBag className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
            <p className="text-gray-500 text-sm">No hay pedidos en esta categoría</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}
