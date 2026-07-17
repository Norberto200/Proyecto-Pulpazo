import { useState } from "react";
import { TrendingUp, ShoppingBag, Percent, LayoutGrid, Clock } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function DashboardEjecutivo() {
  const { orders, tables } = useApp();

  // Stats Calculations
  const salesToday = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status === "pendiente").length;
  const occupiedTables = tables.filter((t) => t.status === "ocupado").length;
  const totalTablesCount = tables.length;

  const operatingMargin = orders.length > 0 ? 68.4 : 0.0;

  // Mock Sales Data for 7 days (Graph)
  const days = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
  const salesHistory = [1200, 1900, 1500, 2100, 2400, 3500, salesToday > 0 ? salesToday : 2800];
  const maxSale = Math.max(...salesHistory, 100);

  // SVG Chart path calculation
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

  // Calculate curve line path (cubic bezier curve)
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpX1 = points[i].x + (points[i + 1].x - points[i].x) / 3;
    const cpY1 = points[i].y;
    const cpX2 = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3;
    const cpY2 = points[i + 1].y;
    linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  // Area path (closes at the bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="p-8 h-full overflow-auto font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl text-[#D4AF37] tracking-wide">Dashboard Ejecutivo</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen estratégico de operaciones y salud financiera.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 relative overflow-hidden group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Ventas de Hoy</span>
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-white font-light tracking-wide">${salesToday.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-green-500 mt-2 flex items-center gap-1 font-medium">
              <span>↑ +12.5%</span> <span className="text-gray-600">vs ayer</span>
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 relative overflow-hidden group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Pedidos Activos</span>
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-white font-light tracking-wide">{activeOrdersCount}</p>
            <p className="text-xs text-gray-500 mt-2">En proceso de atención</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 relative overflow-hidden group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Margen Operativo</span>
              <Percent className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-white font-light tracking-wide">{operatingMargin}%</p>
            <p className="text-xs text-gray-500 mt-2">Promedio de utilidad bruta</p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 relative overflow-hidden group hover:border-[#D4AF37]/45 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Mesas Ocupadas</span>
              <LayoutGrid className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
            <p className="text-3xl text-white font-light tracking-wide">{occupiedTables}/{totalTablesCount}</p>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mt-3.5">
              <div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] rounded-full transition-all duration-500"
                style={{ width: `${(occupiedTables / (totalTablesCount || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm tracking-[0.18em] text-[#D4AF37] uppercase font-semibold">Tendencia de Ventas Semanales</h2>
              <p className="text-xs text-gray-500 mt-1">Evolución de ingresos y ventas en piso</p>
            </div>
            <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20">Últimos 7 días</span>
          </div>

          <div className="relative w-full h-[180px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D4AF37"/>
                  <stop offset="100%" stopColor="#F4D03F"/>
                </linearGradient>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212,175,55,0.22)"/>
                  <stop offset="100%" stopColor="rgba(212,175,55,0)"/>
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={padding + chartHeight / 2} x2={width - padding} y2={padding + chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

              {/* Area */}
              <path d={areaPath} fill="url(#areaGrad)" />

              {/* Curve Line */}
              <path d={linePath} fill="none" stroke="url(#salesGrad)" strokeWidth={2.5} strokeLinecap="round" />

              {/* Active Points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredIndex === idx ? 6 : 4}
                    fill={hoveredIndex === idx ? "#F4D03F" : "#111"}
                    stroke="#D4AF37"
                    strokeWidth={hoveredIndex === idx ? 2.5 : 1.8}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* Tooltip on hover */}
                  {hoveredIndex === idx && (
                    <g transform={`translate(${pt.x}, ${pt.y - 28})`}>
                      <rect x="-40" y="-18" width="80" height="24" rx="4" fill="#0d0d0d" stroke="#D4AF37" strokeWidth={1} />
                      <text x="0" y="-3" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                        ${salesHistory[idx]}
                      </text>
                    </g>
                  )}
                  {/* Axis Label */}
                  <text
                    x={pt.x}
                    y={height - padding + 18}
                    textAnchor="middle"
                    fill="#555"
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

        {/* Lower Grid */}
        <div className="w-full">
          {/* Active Kitchen Orders */}
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 w-full flex flex-col min-h-[220px]">
            <h2 className="text-xs tracking-[0.18em] text-[#D4AF37] uppercase font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" strokeWidth={1.5} /> Flujo de Comandas (Cocina)
            </h2>
            
            {orders.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <p className="text-xs text-gray-600 tracking-wide">No hay comandas activas en este momento.</p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[220px] pr-1">
                {orders.map((o) => (
                  <div key={o.id} className="bg-[#0a0a0a] border border-[#D4AF37]/10 p-3.5 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-semibold">{o.id}</span>
                        {o.table && (
                          <span className="text-[9px] bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded">
                            Mesa: {o.table}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {o.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-white text-xs font-semibold">${o.total.toFixed(2)}</span>
                      <p className="text-[9px] text-green-500 mt-0.5 capitalize">{o.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
