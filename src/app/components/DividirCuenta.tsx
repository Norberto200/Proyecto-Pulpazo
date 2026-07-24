import { useState, useMemo } from "react";
import { Users, Plus, Minus, Equal, CheckCircle, DollarSign } from "lucide-react";
import { useApp } from "../context/AppContext";

type SplitMode = "igual" | "porcentaje" | "manual";

export default function DividirCuenta() {
  const { orders } = useApp();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [numPeople, setNumPeople] = useState(2);
  const [splitMode, setSplitMode] = useState<SplitMode>("igual");
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);
  const [customPercentages, setCustomPercentages] = useState<number[]>([]);

  const selectedOrder = useMemo(() =>
    orders.find(o => o.id === selectedOrderId && o.status !== "cancelado")
  , [orders, selectedOrderId]);

  const recentOrders = useMemo(() =>
    orders.filter(o => o.status !== "cancelado").slice(0, 20)
  , [orders]);

  const orderTotal = selectedOrder?.totalConIva ?? 0;

  const splits = useMemo(() => {
    if (!selectedOrder) return [];
    if (splitMode === "igual") {
      const perPerson = orderTotal / numPeople;
      return Array.from({ length: numPeople }, (_, i) => ({
        label: `Persona ${i + 1}`,
        amount: i === numPeople - 1
          ? orderTotal - perPerson * (numPeople - 1)
          : perPerson,
      }));
    }
    if (splitMode === "porcentaje") {
      return Array.from({ length: numPeople }, (_, i) => {
        const pct = customPercentages[i] ?? (100 / numPeople);
        return {
          label: `Persona ${i + 1}`,
          amount: orderTotal * (pct / 100),
          percentage: pct,
        };
      });
    }
    // manual
    return Array.from({ length: numPeople }, (_, i) => ({
      label: `Persona ${i + 1}`,
      amount: customAmounts[i] ?? 0,
    }));
  }, [selectedOrder, splitMode, numPeople, orderTotal, customAmounts, customPercentages]);

  const totalSplit = splits.reduce((s, sp) => s + sp.amount, 0);
  const difference = orderTotal - totalSplit;

  const updateCustomAmount = (idx: number, val: number) => {
    const arr = [...customAmounts];
    arr[idx] = val;
    setCustomAmounts(arr);
  };

  const updateCustomPercentage = (idx: number, val: number) => {
    const arr = [...customPercentages];
    arr[idx] = val;
    setCustomPercentages(arr);
  };

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="p-6 h-full overflow-auto bg-background text-foreground">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dividir Cuenta</h1>
          <p className="text-gray-400 text-sm">Divide el total de un pedido entre varios clientes</p>
        </div>

        {/* Order Selector */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <label className="block text-[10px] tracking-widest text-gray-500 uppercase font-semibold">Seleccionar Pedido</label>
          <select
            value={selectedOrderId}
            onChange={e => { setSelectedOrderId(e.target.value); setCustomAmounts([]); setCustomPercentages([]); }}
            className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="">-- Selecciona un pedido --</option>
            {recentOrders.map(o => (
              <option key={o.id} value={o.id}>
                {o.id} — {o.clientName || "Sin nombre"} — {fmt(o.totalConIva)} — {o.items.length} platillos
              </option>
            ))}
          </select>
        </div>

        {selectedOrder && (
          <>
            {/* Order Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Pedido: <span className="text-white font-bold">{selectedOrder.id}</span></span>
                <span className="text-xs text-gray-400">Cliente: <span className="text-white font-bold">{selectedOrder.clientName || "—"}</span></span>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 mb-3">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <span className="text-gray-400">{item.quantity}x {item.name}</span>
                    <span className="text-white font-semibold">{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 flex justify-between">
                  <span className="text-xs text-gray-500">Subtotal</span>
                  <span className="text-xs text-white">{fmt(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.descuento ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">Descuento</span>
                    <span className="text-green-400">-{fmt(selectedOrder.descuento)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">IVA (16%)</span>
                  <span className="text-white">{fmt(selectedOrder.iva)}</span>
                </div>
                <div className="border-t border-dashed border-gray-700 mt-2 pt-2 flex justify-between">
                  <span className="text-xs text-amber-400 font-bold">TOTAL</span>
                  <span className="text-xs text-amber-400 font-bold">{fmt(orderTotal)}</span>
                </div>
              </div>
            </div>

            {/* Split Configuration */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] tracking-widest text-gray-500 uppercase font-semibold">Configurar División</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setNumPeople(Math.max(2, numPeople - 1))}
                    className="w-7 h-7 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500/50 transition-colors cursor-pointer">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-white font-bold text-lg w-8 text-center">{numPeople}</span>
                  <button onClick={() => setNumPeople(Math.min(12, numPeople + 1))}
                    className="w-7 h-7 rounded-lg border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500/50 transition-colors cursor-pointer">
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="text-gray-500 text-xs ml-1">personas</span>
                </div>
              </div>

              {/* Split Mode */}
              <div className="flex gap-1 bg-background rounded-lg p-1">
                {([
                  { id: "igual" as const, label: "Igual" },
                  { id: "porcentaje" as const, label: "Porcentaje" },
                  { id: "manual" as const, label: "Manual" },
                ]).map(m => (
                  <button key={m.id} onClick={() => setSplitMode(m.id)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                      splitMode === m.id ? "bg-amber-500/20 text-amber-400" : "text-gray-400 hover:text-gray-300"
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Per-person breakdown */}
              <div className="space-y-2">
                {splits.map((sp, i) => (
                  <div key={i} className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span className="text-xs text-gray-400 flex-1">{sp.label}</span>
                    {splitMode === "porcentaje" && (
                      <input type="number" min="0" max="100" step="1"
                        value={sp.percentage ?? Math.round(100 / numPeople)}
                        onChange={e => updateCustomPercentage(i, Number(e.target.value))}
                        className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-amber-500/50" />
                    )}
                    {splitMode === "porcentaje" && <span className="text-gray-500 text-xs">%</span>}
                    {splitMode === "manual" && (
                      <input type="number" min="0" step="0.01"
                        value={customAmounts[i] ?? ""}
                        onChange={e => updateCustomAmount(i, Number(e.target.value))}
                        placeholder="0.00"
                        className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white text-right focus:outline-none focus:border-amber-500/50" />
                    )}
                    {splitMode === "igual" && (
                      <span className="text-white font-bold text-sm">{fmt(sp.amount)}</span>
                    )}
                    {splitMode !== "igual" && (
                      <span className="text-white font-bold text-sm">{fmt(sp.amount)}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Difference warning */}
              {splitMode !== "igual" && Math.abs(difference) > 0.01 && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  difference > 0
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                  <span>{difference > 0 ? `Faltan ${fmt(difference)} por asignar` : `Sobran ${fmt(Math.abs(difference))}`}</span>
                </div>
              )}

              {/* Total verification */}
              <div className="border-t border-gray-700 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Equal className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400">Total dividido</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${Math.abs(difference) < 0.01 ? "text-green-400" : "text-yellow-400"}`}>
                    {fmt(totalSplit)}
                  </span>
                  {Math.abs(difference) < 0.01 && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {!selectedOrder && (
          <div className="text-center py-16 text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Selecciona un pedido para dividir la cuenta</p>
          </div>
        )}
      </div>
    </div>
  );
}
