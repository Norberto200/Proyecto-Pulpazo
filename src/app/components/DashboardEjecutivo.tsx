import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { TrendingUp, ShoppingBag, LayoutGrid, Clock, Plus, Banknote, CreditCard, Laptop, ExternalLink, Truck, CheckCircle, XCircle, UtensilsCrossed, Store, Utensils, BookOpen, Receipt, Package } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Modal, ModalBody } from "./ui/Modal";
import { fmt, calculateCashInDrawer, STARTING_CASH } from "../lib/utils";

export default function DashboardEjecutivo() {
  const navigate = useNavigate();
  const { orders, tables, gastos, addGasto, abonos, addAbono, updateOrderStatus, insumos, notificaciones, addNotificacion } = useApp();
  const stockCheckDone = useRef(false);

  // Filter to today's orders
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.date.slice(0, 10) === today);

  // Financial calculations
  const salesToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = todayOrders.filter((o) => o.status === "pendiente" || o.status === "en_preparacion" || o.status === "listo").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupado").length;
  const totalTablesCount = tables.length;

  // Corte de turno calculations
  const efectivoSales = todayOrders
    .filter((o) => o.paymentMethod === "Efectivo")
    .reduce((sum, o) => sum + o.total, 0);

  const tarjetaSales = todayOrders
    .filter((o) => o.paymentMethod === "Tarjeta de Crédito/Débito")
    .reduce((sum, o) => sum + o.total, 0);

  const platformSales = todayOrders
    .filter((o) => o.orderType === "uber" || o.orderType === "rappi")
    .reduce((sum, o) => sum + o.total, 0);

  // Order type breakdown
  const localOrders = todayOrders.filter((o) => o.orderType === "local");
  const llevarOrders = todayOrders.filter((o) => o.orderType === "llevar");
  const domicilioOrders = todayOrders.filter((o) => o.orderType === "domicilio");
  const uberOrders = todayOrders.filter((o) => o.orderType === "uber");
  const rappiOrders = todayOrders.filter((o) => o.orderType === "rappi");
  const localTotal = localOrders.reduce((s, o) => s + o.total, 0);
  const llevarTotal = llevarOrders.reduce((s, o) => s + o.total, 0);
  const domicilioTotal = domicilioOrders.reduce((s, o) => s + o.total, 0);
  const uberTotal = uberOrders.reduce((s, o) => s + o.total, 0);
  const rappiTotal = rappiOrders.reduce((s, o) => s + o.total, 0);

  const totalSales = efectivoSales + tarjetaSales + platformSales;

  const totalGastos = gastos.reduce((sum, g) => sum + g.amount, 0);
  const totalAbonos = abonos.reduce((sum, a) => sum + a.amount, 0);

  const cashInDrawer = calculateCashInDrawer(efectivoSales, totalAbonos, totalGastos);

  // Chart data calculations
  const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const salesHistory = [1200, 1900, 1500, 2100, 2400, 3500, salesToday > 0 ? salesToday : 2800];
  const maxSale = Math.max(...salesHistory, 100);

  const width = 600;
  const height = 180;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = salesHistory.map((val, idx) => {
    const x = padding + (idx / (salesHistory.length - 1)) * chartWidth;
    const y = padding + chartHeight - (val / maxSale) * chartHeight;
    return { x, y };
  });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
    const cpY1 = points[i].y;
    const cpX2 = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3;
    const cpY2 = points[i + 1].y;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-trigger low stock notifications on first load
  useEffect(() => {
    if (stockCheckDone.current) return;
    stockCheckDone.current = true;
    const lowStockItems = insumos.filter(i => i.stockActual <= i.stockMinimo && i.stockActual > 0);
    const outOfStockItems = insumos.filter(i => i.stockActual === 0);
    for (const item of outOfStockItems) {
      addNotificacion({
        tipo: "stock_bajo",
        titulo: "Sin Stock",
        mensaje: `${item.name} se ha agotado (${item.stockActual}/${item.stockMinimo} ${item.unit})`,
      });
    }
    for (const item of lowStockItems) {
      addNotificacion({
        tipo: "stock_bajo",
        titulo: "Stock Bajo",
        mensaje: `${item.name} tiene stock bajo: ${item.stockActual} ${item.unit} (mínimo: ${item.stockMinimo})`,
      });
    }
  }, [insumos, addNotificacion]);

  // New Expense / Abono modal states
  const [showAddGasto, setShowAddGasto] = useState(false);
  const [gastoDesc, setGastoDesc] = useState("");
  const [gastoAmount, setGastoAmount] = useState("");
  const [gastoCategory, setGastoCategory] = useState("Materia Prima");

  const [showAddAbono, setShowAddAbono] = useState(false);
  const [abonoClient, setAbonoClient] = useState("");
  const [abonoAmount, setAbonoAmount] = useState("");

  const handleSaveGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gastoDesc || !gastoAmount) return;
    addGasto({
      description: gastoDesc,
      amount: parseFloat(gastoAmount),
      category: gastoCategory,
    });
    setGastoDesc("");
    setGastoAmount("");
    setShowAddGasto(false);
  };

  const handleSaveAbono = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abonoClient || !abonoAmount) return;
    addAbono({
      clientName: abonoClient,
      amount: parseFloat(abonoAmount),
    });
    setAbonoClient("");
    setAbonoAmount("");
    setShowAddAbono(false);
  };

  const getPlatformBadge = (type: string) => {
    switch (type) {
      case "uber":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "rappi":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20";
      case "domicilio":
        return "bg-purple-500/10 text-purple-500 border border-purple-500/20";
      case "llevar":
        return "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
    }
  };

  return (
    <div className="p-8 h-full overflow-auto bg-background text-foreground transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Dashboard Ejecutivo</h1>
            <p className="text-gray-500 text-xs mt-1">Resumen estratégico de operaciones y salud financiera.</p>
          </div>
          <span className="text-[10px] tracking-wider bg-gold/10 border border-gold/25 text-[#b3922e] px-2.5 py-1 rounded font-semibold uppercase">
            Marisquería El Pulpazo
          </span>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Mapa de Mesas", icon: LayoutGrid, path: "/dashboard/mapa-mesas", color: "text-primary" },
            { label: "Tomar Pedido", icon: BookOpen, path: "/dashboard/cliente-menu", color: "text-blue-500" },
            { label: "Pedido Actual", icon: ShoppingBag, path: "/dashboard/carrito", color: "text-emerald-500" },
            { label: "Corte de Caja", icon: Receipt, path: "/dashboard/corte-caja", color: "text-amber-500" },
            { label: "Inventario", icon: Package, path: "/dashboard/inventario", color: "text-purple-500" },
            { label: "Promotores", icon: Truck, path: "/dashboard/promotores", color: "text-orange-500" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2.5 px-3 py-3 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group shadow-sm"
            >
              <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
              <span className="text-[10px] text-foreground font-semibold tracking-wide">{item.label}</span>
              <ExternalLink className="w-3 h-3 text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 - Ventas */}
          <button
            onClick={() => navigate("/dashboard/historial")}
            className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-primary/45 transition-all text-left cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ventas de Hoy</span>
              <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{fmt(salesToday)}</p>
            <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1 font-semibold">
              <span>{todayOrders.length} pedidos hoy</span>
              <ExternalLink className="w-3 h-3 text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>

          {/* Card 2 - Pedidos Activos */}
          <button
            onClick={() => navigate("/dashboard/historial")}
            className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-primary/45 transition-all text-left cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pedidos Activos</span>
              <ShoppingBag className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{activeOrdersCount}</p>
            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
              En proceso de preparación
              <ExternalLink className="w-3 h-3 text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>

          {/* Card 3 - Margen */}
          <button
            onClick={() => navigate("/dashboard/corte-caja")}
            className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-primary/45 transition-all text-left cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Efectivo en Caja</span>
              <Banknote className="w-4 h-4 text-green-500" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-green-500 font-light tracking-wide">{fmt(cashInDrawer)}</p>
            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
              Ver corte de caja
              <ExternalLink className="w-3 h-3 text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>

          {/* Card 4 - Mesas */}
          <button
            onClick={() => navigate("/dashboard/mapa-mesas")}
            className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-primary/45 transition-all text-left cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mesas Ocupadas</span>
              <LayoutGrid className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{occupiedTables}/{totalTablesCount}</p>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-3.5 border border-border/5">
              <div
                className="h-full bg-gradient-to-r from-primary to-[#F4D03F] rounded-full transition-all duration-500"
                style={{ width: `${(occupiedTables / (totalTablesCount || 1)) * 100}%` }}
              />
            </div>
          </button>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold">Tendencia de Ventas Semanales</h2>
              <p className="text-xs text-gray-500 mt-1">Evolución de ingresos y ventas globales</p>
            </div>
            <span className="text-xs text-[#b3922e] bg-primary/10 px-2.5 py-1 rounded border border-border font-semibold">Últimos 7 días</span>
          </div>

          <div className="relative w-full h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary)"/>
                  <stop offset="100%" stopColor="#F4D03F"/>
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212,175,55,0.18)"/>
                  <stop offset="100%" stopColor="rgba(212,175,55,0)"/>
                </linearGradient>
              </defs>

              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(212,175,55,0.1)" strokeWidth={0.5} />
              <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(212,175,55,0.1)" strokeWidth={0.5} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth={0.8} />

              <path d={areaPath} fill="url(#areaGrad)" />
              <path d={linePath} fill="none" stroke="url(#salesGrad)" strokeWidth={2.5} strokeLinecap="round" />

              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    fill={hoveredIndex === idx ? "#F4D03F" : "var(--card)"}
                    stroke="var(--primary)"
                    strokeWidth={hoveredIndex === idx ? 2.5 : 1.8}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {hoveredIndex === idx && (
                    <g transform={`translate(${pt.x}, ${pt.y - 28})`}>
                      <rect x="-40" y="-18" width="80" height="24" rx="4" fill="var(--background)" stroke="var(--primary)" strokeWidth={1} />
                      <text x="0" y="-3" textAnchor="middle" fill="var(--foreground)" fontSize="10" fontWeight="bold">
                        ${salesHistory[idx]}
                      </text>
                    </g>
                  )}
                  <text
                    x={pt.x}
                    y={height - padding + 18}
                    textAnchor="middle"
                    fill="var(--foreground)"
                    fillOpacity={0.6}
                    fontSize="10"
                    fontWeight="500"
                  >
                    {days[idx]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Lower Content Layout (Cocina & Finanzas/Corte) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Kitchen / Comandas Flow */}
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-3 flex flex-col min-h-[350px] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={1.5} /> Cocina — Hoy
              </h2>
              <button
                onClick={() => navigate("/dashboard/historial")}
                className="text-[9px] text-gray-500 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
              >
                Ver Historial <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            {todayOrders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <p className="text-xs text-gray-500 tracking-wide">No hay comandas hoy.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {todayOrders.map((o) => (
                  <div key={o.id} className="bg-background border border-border p-3.5 rounded-lg shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-foreground text-xs font-bold">{o.id}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${getPlatformBadge(o.orderType)}`}>
                            {o.orderType} {o.table && `Mesa ${o.table}`}
                          </span>
                          {o.clientName && (
                            <span className="text-[9px] text-gray-500 italic">
                              ({o.clientName})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-semibold">
                          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                        {o.notes && (
                          <p className="text-[10px] text-yellow-500 mt-1 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10 italic">
                            Nota: "{o.notes}"
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-[#b3922e] text-xs font-bold">{fmt(o.total)}</span>
                        <p className={`text-[9px] mt-1 font-semibold uppercase ${
                          o.status === "completado" ? "text-green-500"
                          : o.status === "cancelado" ? "text-red-500"
                          : "text-yellow-500"
                        }`}>{o.status}</p>
                      </div>
                    </div>
                    {(o.status === "pendiente" || o.status === "en_preparacion" || o.status === "listo") && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                        {o.status === "pendiente" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "en_preparacion")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <UtensilsCrossed className="w-3 h-3" /> Cocina
                          </button>
                        )}
                        {o.status === "en_preparacion" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "listo")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" /> Listo
                          </button>
                        )}
                        {o.status === "listo" && (
                          <button
                            onClick={() => updateOrderStatus(o.id, "completado")}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" /> Entregar
                          </button>
                        )}
                        <button
                          onClick={() => updateOrderStatus(o.id, "cancelado")}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corte de Turno / Caja & Gastos */}
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col min-h-[350px] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold flex items-center gap-2">
                Corte de Turno / Caja
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400 font-mono font-normal">Inicial: {fmt(STARTING_CASH)}</span>
                <button
                  onClick={() => navigate("/dashboard/corte-caja")}
                  className="text-[9px] text-gray-500 hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Ver Corte <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {/* Efectivo */}
              <div className="bg-background border border-border rounded-lg p-3 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
                  <div className="h-full bg-green-500 rounded-r transition-all duration-500" style={{ width: `${totalSales > 0 ? (efectivoSales / totalSales) * 100 : 0}%` }} />
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-green-500/15 flex items-center justify-center">
                    <Banknote className="w-3 h-3 text-green-500" />
                  </div>
                  <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Efectivo</span>
                </div>
                <p className="text-foreground text-sm font-semibold">{fmt(efectivoSales)}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">{todayOrders.filter((o) => o.paymentMethod === "Efectivo").length} ventas · {totalSales > 0 ? Math.round((efectivoSales / totalSales) * 100) : 0}%</p>
              </div>

              {/* Tarjeta */}
              <div className="bg-background border border-border rounded-lg p-3 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
                  <div className="h-full bg-blue-500 rounded-r transition-all duration-500" style={{ width: `${totalSales > 0 ? (tarjetaSales / totalSales) * 100 : 0}%` }} />
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-blue-500/15 flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-blue-500" />
                  </div>
                  <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Tarjeta</span>
                </div>
                <p className="text-foreground text-sm font-semibold">{fmt(tarjetaSales)}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">{todayOrders.filter((o) => o.paymentMethod === "Tarjeta de Crédito/Débito").length} ventas · {totalSales > 0 ? Math.round((tarjetaSales / totalSales) * 100) : 0}%</p>
              </div>

              {/* Plataformas */}
              <div className="bg-background border border-border rounded-lg p-3 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/30">
                  <div className="h-full bg-purple-500 rounded-r transition-all duration-500" style={{ width: `${totalSales > 0 ? (platformSales / totalSales) * 100 : 0}%` }} />
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-5 h-5 rounded bg-purple-500/15 flex items-center justify-center">
                    <Laptop className="w-3 h-3 text-purple-500" />
                  </div>
                  <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Plataformas</span>
                </div>
                <p className="text-foreground text-sm font-semibold">{fmt(platformSales)}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">{uberOrders.length + rappiOrders.length} ventas · {totalSales > 0 ? Math.round((platformSales / totalSales) * 100) : 0}%</p>
              </div>
            </div>

            {/* Order Type Breakdown */}
            <div className="bg-background border border-border rounded-lg p-3 mb-4">
              <p className="text-[9px] tracking-widest text-gray-500 uppercase font-semibold mb-2.5">Ventas por Tipo</p>
              <div className="space-y-2">
                {[
                  { label: "Mesa / Local", count: localOrders.length, total: localTotal, color: "bg-primary", icon: UtensilsCrossed },
                  { label: "Llevar", count: llevarOrders.length, total: llevarTotal, color: "bg-amber-500", icon: Store },
                  { label: "Domicilio", count: domicilioOrders.length, total: domicilioTotal, color: "bg-orange-500", icon: Truck },
                  { label: "Uber Eats", count: uberOrders.length, total: uberTotal, color: "bg-green-500", icon: Utensils },
                  { label: "Rappi", count: rappiOrders.length, total: rappiTotal, color: "bg-red-500", icon: Utensils },
                ].map(({ label, count, total: typeTotal, color, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0`} />
                    <Icon className="w-3 h-3 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[10px] text-gray-400 flex-1 min-w-0 truncate">{label}</span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{count}</span>
                    <div className="w-20 h-1.5 bg-border/30 rounded-full overflow-hidden flex-shrink-0">
                      <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${totalSales > 0 ? (typeTotal / totalSales) * 100 : 0}%` }} />
                    </div>
                    <span className="text-foreground text-[10px] font-semibold flex-shrink-0 w-16 text-right">{fmt(typeTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Flow */}
            <div className="bg-background border border-border rounded-lg p-3 mb-4">
              <p className="text-[9px] tracking-widest text-gray-500 uppercase font-semibold mb-2.5">Flujo de Efectivo</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Caja Inicial
                  </span>
                  <span className="text-foreground text-[10px] font-semibold">{fmt(STARTING_CASH)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Ventas Efectivo
                  </span>
                  <span className="text-green-500 text-[10px] font-semibold">+{fmt(efectivoSales)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Abonos
                  </span>
                  <span className="text-green-500 text-[10px] font-semibold">+{fmt(totalAbonos)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Gastos
                  </span>
                  <span className="text-red-500 text-[10px] font-semibold">-{fmt(totalGastos)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-foreground font-bold flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Efectivo en Caja
                  </span>
                  <span className="text-primary text-xs font-bold">{fmt(cashInDrawer)}</span>
                </div>
              </div>
            </div>

            {/* Action buttons (Gastos & Abonos) */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <button
                onClick={() => setShowAddGasto(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/8 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Gasto
              </button>
              <button
                onClick={() => setShowAddAbono(true)}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 border border-green-500/20 text-green-500 hover:bg-green-500/8 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Abono Fiado
              </button>
            </div>

            {/* Recent Expenses List */}
            <div className="border-t border-border pt-3 flex-1 overflow-auto max-h-[120px]">
              <p className="text-[10px] tracking-widest text-gray-500 uppercase font-semibold mb-2">Gastos Recientes</p>
              {gastos.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">No hay gastos registrados hoy.</p>
              ) : (
                <div className="space-y-1.5">
                  {gastos.slice(0, 3).map((g) => (
                    <div key={g.id} className="flex justify-between items-center text-[10px] bg-background p-1.5 rounded border border-border/5">
                      <div className="min-w-0">
                        <p className="text-foreground font-semibold truncate max-w-[120px]">{g.description}</p>
                        <p className="text-gray-500 text-[8px]">{g.category}</p>
                      </div>
                      <span className="text-red-500 font-semibold flex-shrink-0 ml-2">-{fmt(g.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Add Gasto Modal */}
      <Modal open={showAddGasto} onClose={() => setShowAddGasto(false)} title="Registrar Gasto" maxWidth="xs">
        <ModalBody>
          <form onSubmit={handleSaveGasto} className="space-y-3.5">
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Descripción del Gasto</label>
              <input
                type="text"
                required
                placeholder="Ej. Tortilla Don Neto"
                value={gastoDesc}
                onChange={(e) => setGastoDesc(e.target.value)}
                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="350.00"
                  value={gastoAmount}
                  onChange={(e) => setGastoAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Categoría</label>
                <select
                  value={gastoCategory}
                  onChange={(e) => setGastoCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="Materia Prima">Materia Prima</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddGasto(false)}
                className="flex-1 py-2 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wider transition-all"
              >
                Guardar
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* Add Abono Modal */}
      <Modal open={showAddAbono} onClose={() => setShowAddAbono(false)} title="Registrar Abono" maxWidth="xs">
        <ModalBody>
          <form onSubmit={handleSaveAbono} className="space-y-3.5">
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Nombre del Cliente</label>
              <input
                type="text"
                required
                placeholder="Ej. Felipe Soto"
                value={abonoClient}
                onChange={(e) => setAbonoClient(e.target.value)}
                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Monto Abonado ($)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="500.00"
                value={abonoAmount}
                onChange={(e) => setAbonoAmount(e.target.value)}
                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddAbono(false)}
                className="flex-1 py-2 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold tracking-wider transition-all animate-pulse"
              >
                Confirmar
              </button>
            </div>
          </form>
        </ModalBody>
      </Modal>

    </div>
  );
}
