import { useState } from "react";
import { TrendingUp, ShoppingBag, Percent, LayoutGrid, Clock, Plus, Banknote, CreditCard, Laptop, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useApp, Order } from "../context/AppContext";

export default function DashboardEjecutivo() {
  const { orders, tables, gastos, addGasto, abonos, addAbono } = useApp();

  // Financial calculations
  const salesToday = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status === "pendiente").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupado").length;
  const totalTablesCount = tables.length;
  const operatingMargin = orders.length > 0 ? 68.4 : 0.0;

  // Corte de turno calculations
  const startingCash = 1500.00; // Fondo de caja inicial
  
  const efectivoSales = orders
    .filter((o) => o.paymentMethod === "Efectivo")
    .reduce((sum, o) => sum + o.total, 0);

  const tarjetaSales = orders
    .filter((o) => o.paymentMethod === "Tarjeta de Crédito/Débito")
    .reduce((sum, o) => sum + o.total, 0);

  const platformSales = orders
    .filter((o) => o.orderType === "uber" || o.orderType === "rappi")
    .reduce((sum, o) => sum + o.total, 0);

  const totalGastos = gastos.reduce((sum, g) => sum + g.amount, 0);
  const totalAbonos = abonos.reduce((sum, a) => sum + a.amount, 0);

  // Cash in drawer = start + efectivo sales + abonos - expenses
  const cashInDrawer = startingCash + efectivoSales + totalAbonos - totalGastos;

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
            <h1 className="text-2xl text-[#D4AF37] tracking-wide">Dashboard Ejecutivo</h1>
            <p className="text-gray-500 text-xs mt-1">Resumen estratégico de operaciones y salud financiera.</p>
          </div>
          <span className="text-[10px] tracking-wider bg-gold/10 border border-gold/25 text-[#b3922e] px-2.5 py-1 rounded font-semibold uppercase">
            Marisquería El Pulpazo
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ventas de Hoy</span>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">${salesToday.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1 font-semibold">
              <span>↑ +12.5%</span> <span className="text-gray-500 font-normal">vs ayer</span>
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pedidos Activos</span>
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{activeOrdersCount}</p>
            <p className="text-[10px] text-gray-500 mt-2">En proceso de preparación</p>
          </div>

          {/* Card 3 */}
          <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Margen Operativo</span>
              <Percent className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{operatingMargin}%</p>
            <p className="text-[10px] text-gray-500 mt-2 font-normal">Promedio utilidad bruta</p>
          </div>

          {/* Card 4 */}
          <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden shadow-sm group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Mesas Ocupadas</span>
              <LayoutGrid className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-foreground font-light tracking-wide">{occupiedTables}/{totalTablesCount}</p>
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-3.5 border border-border/5">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] rounded-full transition-all duration-500"
                style={{ width: `${(occupiedTables / (totalTablesCount || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs tracking-[0.18em] text-[#D4AF37] uppercase font-bold">Tendencia de Ventas Semanales</h2>
              <p className="text-xs text-gray-500 mt-1">Evolución de ingresos y ventas globales</p>
            </div>
            <span className="text-xs text-[#b3922e] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-border font-semibold">Últimos 7 días</span>
          </div>

          <div className="relative w-full h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D4AF37"/>
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
                    stroke="#D4AF37"
                    strokeWidth={hoveredIndex === idx ? 2.5 : 1.8}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {hoveredIndex === idx && (
                    <g transform={`translate(${pt.x}, ${pt.y - 28})`}>
                      <rect x="-40" y="-18" width="80" height="24" rx="4" fill="var(--background)" stroke="#D4AF37" strokeWidth={1} />
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
            <h2 className="text-xs tracking-[0.18em] text-[#D4AF37] uppercase font-bold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" strokeWidth={1.5} /> Flujo de Comandas (Cocina)
            </h2>
            
            {orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <p className="text-xs text-gray-500 tracking-wide">No hay comandas activas en este momento.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {orders.map((o) => (
                  <div key={o.id} className="bg-background border border-border p-3.5 rounded-lg flex items-center justify-between shadow-xs">
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
                      <span className="text-[#b3922e] text-xs font-bold">${o.total.toFixed(2)}</span>
                      <p className="text-[9px] text-green-500 mt-1 font-semibold uppercase">{o.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corte de Turno / Caja & Gastos */}
          <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2 flex flex-col min-h-[350px] shadow-sm space-y-5">
            <h2 className="text-xs tracking-[0.18em] text-[#D4AF37] uppercase font-bold flex items-center justify-between">
              <span>Corte de Turno / Caja</span>
              <span className="text-[9px] text-gray-400 font-mono font-normal">Caja Inicial: ${startingCash.toFixed(2)}</span>
            </h2>

            {/* Financial break down */}
            <div className="bg-background border border-border rounded-lg p-4 space-y-2.5 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Banknote className="w-3.5 h-3.5 text-green-500" /> Ventas en Efectivo:</span>
                <span className="text-foreground font-semibold">${efectivoSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-blue-500" /> Ventas con Tarjeta:</span>
                <span className="text-foreground font-semibold">${tarjetaSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 flex items-center gap-1"><Laptop className="w-3.5 h-3.5 text-purple-500" /> Reparto / Plataformas:</span>
                <span className="text-foreground font-semibold">${platformSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border/10 pt-2.5 text-red-500">
                <span className="flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> Total Gastos / Egresos:</span>
                <span className="font-semibold">-${totalGastos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-500">
                <span className="flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Abonos Clientes Fiados:</span>
                <span className="font-semibold">+${totalAbonos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm text-[#b3922e] font-bold">
                <span>Efectivo Neto en Caja:</span>
                <span>${cashInDrawer.toFixed(2)}</span>
              </div>
            </div>

            {/* Action buttons (Gastos & Abonos) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setShowAddGasto(true)}
                className="flex items-center justify-center gap-1 px-2.5 py-2 border border-border text-foreground hover:bg-background rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-red-500" /> Registrar Gasto
              </button>
              <button
                onClick={() => setShowAddAbono(true)}
                className="flex items-center justify-center gap-1 px-2.5 py-2 border border-border text-foreground hover:bg-background rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-green-500" /> Abono de Fiado
              </button>
            </div>

            {/* Recent Expenses List */}
            <div className="border-t border-border pt-3 flex-1 overflow-auto max-h-[140px]">
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
                      <span className="text-red-500 font-semibold flex-shrink-0 ml-2">-${g.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Add Gasto Modal */}
      {showAddGasto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-xs overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-xs tracking-widest text-[#D4AF37] uppercase font-semibold">Registrar Gasto</h3>
              <button onClick={() => setShowAddGasto(false)} className="text-gray-500 hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveGasto} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Descripción del Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tortilla Don Neto"
                  value={gastoDesc}
                  onChange={(e) => setGastoDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
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
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Categoría</label>
                  <select
                    value={gastoCategory}
                    onChange={(e) => setGastoCategory(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
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
          </div>
        </div>
      )}

      {/* Add Abono Modal */}
      {showAddAbono && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-xs overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-xs tracking-widest text-[#D4AF37] uppercase font-semibold">Registrar Abono</h3>
              <button onClick={() => setShowAddAbono(false)} className="text-gray-500 hover:text-foreground cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAbono} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Felipe Soto"
                  value={abonoClient}
                  onChange={(e) => setAbonoClient(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
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
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
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
          </div>
        </div>
      )}

    </div>
  );
}
