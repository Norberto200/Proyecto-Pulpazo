import { useState, useMemo } from "react";
import {
  TrendingUp, Download, Calendar, Filter, BarChart3,
  ShoppingBag, DollarSign, UtensilsCrossed, Truck, Smartphone,
  Store, ArrowUpRight, ArrowDownRight, PieChart, Package,
} from "lucide-react";
import { useApp } from "../context/AppContext";

type DateRange = "today" | "7d" | "30d" | "all";

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function getRangeDates(range: DateRange): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start = end;
  if (range === "today") start = end;
  else if (range === "7d") {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    start = d.toISOString().slice(0, 10);
  } else if (range === "30d") {
    const d = new Date(now); d.setDate(d.getDate() - 30);
    start = d.toISOString().slice(0, 10);
  } else {
    start = "2020-01-01";
  }
  return { start, end };
}

function exportCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const { orders, dishes, insumos, recetas } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"resumen" | "ventas" | "platillos" | "inventario">("resumen");

  const { start, end } = getRangeDates(dateRange);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const d = o.date.slice(0, 10);
      if (d < start || d > end) return false;
      if (typeFilter !== "all" && o.orderType !== typeFilter) return false;
      return true;
    });
  }, [orders, start, end, typeFilter]);

  const completedOrders = useMemo(() =>
    filteredOrders.filter(o => o.status === "completado")
  , [filteredOrders]);

  // Stats
  const totalSales = useMemo(() =>
    completedOrders.reduce((s, o) => s + o.subtotal, 0)
  , [completedOrders]);

  const totalIVA = useMemo(() =>
    completedOrders.reduce((s, o) => s + o.iva, 0)
  , [completedOrders]);

  const totalWithIVA = useMemo(() =>
    completedOrders.reduce((s, o) => s + o.totalConIva, 0)
  , [completedOrders]);

  const avgTicket = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

  // Sales by type
  const salesByType = useMemo(() => {
    const map: Record<string, number> = {};
    completedOrders.forEach(o => {
      map[o.orderType] = (map[o.orderType] || 0) + o.subtotal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completedOrders]);

  // Sales by payment method
  const salesByPayment = useMemo(() => {
    const map: Record<string, number> = {};
    completedOrders.forEach(o => {
      map[o.paymentMethod] = (map[o.paymentMethod] || 0) + o.subtotal;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completedOrders]);

  // Top dishes
  const topDishes = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number; cost: number }> = {};
    completedOrders.forEach(o => {
      o.items.forEach(item => {
        if (!map[item.id]) {
          const dish = dishes.find(d => d.id === item.id);
          map[item.id] = { name: item.name, qty: 0, revenue: 0, cost: dish?.cost || 0 };
        }
        map[item.id].qty += item.quantity;
        map[item.id].revenue += item.price * item.quantity;
      });
    });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [completedOrders, dishes]);

  // Daily sales for chart
  const dailySales = useMemo(() => {
    const map: Record<string, number> = {};
    completedOrders.forEach(o => {
      const d = o.date.slice(0, 10);
      map[d] = (map[d] || 0) + o.subtotal;
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [completedOrders]);

  const maxDailySales = Math.max(...dailySales.map(d => d[1]), 1);

  // Inventory report
  const inventoryReport = useMemo(() => {
    return insumos.map(insumo => {
      const usage = recetas.filter(r => r.insumoId === insumo.id);
      const totalUsed = usage.reduce((sum, r) => {
        const timesUsed = completedOrders.reduce((count, o) => {
          const itemRecipe = o.items.filter(i => i.id === r.dishId);
          return count + itemRecipe.reduce((c, i) => c + i.quantity, 0);
        }, 0);
        return sum + (r.cantidad * timesUsed);
      }, 0);
      return {
        ...insumo,
        totalUsed,
        value: insumo.stockActual * 0,
        lowStock: insumo.stockActual <= insumo.stockMinimo,
      };
    }).sort((a, b) => b.totalUsed - a.totalUsed);
  }, [insumos, recetas, completedOrders]);

  // Profit calculation
  const totalCost = useMemo(() => {
    return completedOrders.reduce((sum, o) => {
      return sum + o.items.reduce((itemSum, item) => {
        const dish = dishes.find(d => d.id === item.id);
        return itemSum + ((dish?.cost || 0) * item.quantity);
      }, 0);
    }, 0);
  }, [completedOrders, dishes]);

  const profit = totalSales - totalCost;
  const profitMargin = totalSales > 0 ? (profit / totalSales * 100) : 0;

  const fmt = (n: number) => `$${n.toFixed(2)}`;
  const pct = (n: number) => `${n.toFixed(0)}%`;

  return (
    <div className="p-6 h-full overflow-auto bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Reportes de Ventas</h1>
            <p className="text-gray-400 text-sm">Análisis detallado del rendimiento</p>
          </div>
          <button
            onClick={() => {
              const headers = ["Fecha", "Pedido", "Tipo", "Método Pago", "Subtotal", "IVA", "Total"];
              const rows = completedOrders.map(o => [
                o.date.slice(0, 10), o.id, o.orderType, o.paymentMethod,
                o.subtotal.toFixed(2), o.iva.toFixed(2), o.totalConIva.toFixed(2),
              ]);
              exportCSV(headers, rows, `reporte_ventas_${start}_${end}.csv`);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors text-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
            {(["today", "7d", "30d", "all"] as DateRange[]).map(r => (
              <button key={r} onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  dateRange === r ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-gray-300"
                }`}>
                {r === "today" ? "Hoy" : r === "7d" ? "7 Días" : r === "30d" ? "30 Días" : "Todo"}
              </button>
            ))}
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer">
            <option value="all">Todos los tipos</option>
            <option value="local">Local</option>
            <option value="llevar">Llevar</option>
            <option value="domicilio">Domicilio</option>
            <option value="uber">Uber</option>
            <option value="rappi">Rappi</option>
          </select>
          <span className="text-gray-500 text-xs">{completedOrders.length} pedidos completados</span>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Ventas Totales", value: fmt(totalSales), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "IVA Cobrado", value: fmt(totalIVA), icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Ticket Promedio", value: fmt(avgTicket), icon: ShoppingBag, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Utilidad Neta", value: fmt(profit), sub: `${pct(profitMargin)} margen`, icon: profit >= 0 ? ArrowUpRight : ArrowDownRight, color: profit >= 0 ? "text-green-400" : "text-red-400", bg: profit >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-xs">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              {s.sub && <div className="text-gray-500 text-xs mt-1">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {[
            { id: "resumen" as const, label: "Resumen" },
            { id: "ventas" as const, label: "Gráfica de Ventas" },
            { id: "platillos" as const, label: "Top Platillos" },
            { id: "inventario" as const, label: "Inventario" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-gray-300"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* RESUMEN TAB */}
        {activeTab === "resumen" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sales by type */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Ventas por Tipo de Pedido</h3>
              <div className="space-y-3">
                {salesByType.map(([type, amount]) => {
                  const pctVal = totalSales > 0 ? (amount / totalSales * 100) : 0;
                  const typeIcons: Record<string, typeof Store> = { local: Store, llevar: UtensilsCrossed, domicilio: Truck, uber: Smartphone, rappi: Smartphone };
                  const Icon = typeIcons[type] || Store;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-white capitalize">{type}</span>
                        </div>
                        <span className="text-xs text-gray-400">{fmt(amount)} ({pct(pctVal)})</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pctVal}%` }} />
                      </div>
                    </div>
                  );
                })}
                {salesByType.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Sin datos</p>}
              </div>
            </div>

            {/* Sales by payment */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Ventas por Método de Pago</h3>
              <div className="space-y-3">
                {salesByPayment.map(([method, amount]) => {
                  const pctVal = totalSales > 0 ? (amount / totalSales * 100) : 0;
                  return (
                    <div key={method}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white">{method}</span>
                        <span className="text-xs text-gray-400">{fmt(amount)} ({pct(pctVal)})</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pctVal}%` }} />
                      </div>
                    </div>
                  );
                })}
                {salesByPayment.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Sin datos</p>}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Desglose de Costos</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Ingresos (sin IVA)</span>
                  <span className="text-green-400 font-bold">{fmt(totalSales)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Costo de ingredientes</span>
                  <span className="text-red-400 font-bold">-{fmt(totalCost)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between text-sm">
                  <span className="text-white font-bold">Utilidad Neta</span>
                  <span className={`font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(profit)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Margen de utilidad</span>
                  <span>{pct(profitMargin)}</span>
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Resumen del Período</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total pedidos</span>
                  <span className="text-white font-bold">{completedOrders.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pedidos cancelados</span>
                  <span className="text-red-400 font-bold">{filteredOrders.filter(o => o.status === "cancelado").length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platillos vendidos</span>
                  <span className="text-white font-bold">{completedOrders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0), 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">IVA total cobrado</span>
                  <span className="text-blue-400 font-bold">{fmt(totalIVA)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total con IVA</span>
                  <span className="text-white font-bold">{fmt(totalWithIVA)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VENTAS TAB */}
        {activeTab === "ventas" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Ventas Diarias</h3>
            {dailySales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay datos de ventas para este período</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dailySales.map(([date, amount]) => {
                  const barWidth = (amount / maxDailySales) * 100;
                  return (
                    <div key={date} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-20 text-right">{formatDate(date)}</span>
                      <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                        <div className="h-full bg-amber-500 rounded flex items-center px-2 transition-all"
                          style={{ width: `${Math.max(barWidth, 5)}%` }}>
                          {barWidth > 15 && (
                            <span className="text-black text-[10px] font-bold">{fmt(amount)}</span>
                          )}
                        </div>
                      </div>
                      {barWidth <= 15 && (
                        <span className="text-xs text-gray-400">{fmt(amount)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PLATILLOS TAB */}
        {activeTab === "platillos" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">Platillos Más Vendidos</h3>
            </div>
            {topDishes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay datos de platillos</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-wider">
                    <th className="px-5 py-3 text-left font-semibold">#</th>
                    <th className="px-5 py-3 text-left font-semibold">Platillo</th>
                    <th className="px-5 py-3 text-center font-semibold">Vendidos</th>
                    <th className="px-5 py-3 text-right font-semibold">Ingresos</th>
                    <th className="px-5 py-3 text-right font-semibold">Costo</th>
                    <th className="px-5 py-3 text-right font-semibold">Utilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {topDishes.map((dish, idx) => {
                    const dishProfit = dish.revenue - (dish.cost * dish.qty);
                    return (
                      <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3 text-amber-400 font-bold text-sm">{idx + 1}</td>
                        <td className="px-5 py-3 text-white text-sm font-medium">{dish.name}</td>
                        <td className="px-5 py-3 text-center text-white text-sm font-bold">{dish.qty}</td>
                        <td className="px-5 py-3 text-right text-green-400 text-sm">{fmt(dish.revenue)}</td>
                        <td className="px-5 py-3 text-right text-red-400 text-sm">{fmt(dish.cost * dish.qty)}</td>
                        <td className={`px-5 py-3 text-right text-sm font-bold ${dishProfit >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(dishProfit)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* INVENTARIO TAB */}
        {activeTab === "inventario" && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">Estado del Inventario</h3>
              <p className="text-gray-500 text-xs mt-1">Uso de insumos en el período seleccionado</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Insumo</th>
                  <th className="px-5 py-3 text-center font-semibold">Stock Actual</th>
                  <th className="px-5 py-3 text-center font-semibold">Mínimo</th>
                  <th className="px-5 py-3 text-center font-semibold">Unidad</th>
                  <th className="px-5 py-3 text-center font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {inventoryReport.map(item => (
                  <tr key={item.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{item.name}</td>
                    <td className="px-5 py-3 text-center text-white text-sm">{item.stockActual}</td>
                    <td className="px-5 py-3 text-center text-gray-400 text-sm">{item.stockMinimo}</td>
                    <td className="px-5 py-3 text-center text-gray-400 text-xs">{item.unit}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.stockActual === 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        item.lowStock ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {item.stockActual === 0 ? "Agotado" : item.lowStock ? "Bajo" : "Saludable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
