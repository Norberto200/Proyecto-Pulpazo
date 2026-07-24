import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, ShoppingBag, XCircle, Settings, Package } from "lucide-react";
import { useApp, Notificacion } from "../context/AppContext";

const iconMap: Record<Notificacion["tipo"], typeof Bell> = {
  stock_bajo: Package,
  pedido_listo: ShoppingBag,
  pedido_cancelado: XCircle,
  sistema: Settings,
};

const colorMap: Record<Notificacion["tipo"], string> = {
  stock_bajo: "text-yellow-400 bg-yellow-500/10",
  pedido_listo: "text-green-400 bg-green-500/10",
  pedido_cancelado: "text-red-400 bg-red-500/10",
  sistema: "text-blue-400 bg-blue-500/10",
};

function timeAgo(fecha: string): string {
  const diff = Date.now() - new Date(fecha).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function NotificacionesBell() {
  const { notificaciones, markAsRead, markAllAsRead, deleteNotificacion, clearAllNotificaciones, unreadCount } = useApp();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-primary hover:text-[#F4D03F] transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
            <span className="text-xs font-bold text-white tracking-wide">Notificaciones</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[10px] text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Marcar todo leído
                </button>
              )}
              {notificaciones.length > 0 && (
                <button onClick={clearAllNotificaciones} className="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer">Limpiar</button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto">
            {notificaciones.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                Sin notificaciones
              </div>
            ) : (
              notificaciones.slice(0, 30).map(n => {
                const Icon = iconMap[n.tipo] || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.leida && markAsRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800/50 transition-colors cursor-pointer ${
                      n.leida ? "opacity-60 hover:opacity-80" : "hover:bg-gray-800/50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[n.tipo]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white font-semibold truncate">{n.titulo}</p>
                        {!n.leida && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.mensaje}</p>
                      <span className="text-[9px] text-gray-600 mt-1 block">{timeAgo(n.fecha)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotificacion(n.id); }}
                      className="text-gray-600 hover:text-red-400 flex-shrink-0 mt-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
