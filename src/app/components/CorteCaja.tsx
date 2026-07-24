import { useState, useMemo, useEffect } from "react";
import {
  DollarSign, Clock, Printer, AlertTriangle,
  CheckCircle2, Banknote, CreditCard, Laptop,
  ArrowDownRight, ArrowUpRight, Receipt,
} from "lucide-react";
import { Modal, ModalBody, ModalFooter } from "./ui/Modal";
import { useApp } from "../context/AppContext";
import { fmt, STARTING_CASH } from "../lib/utils";
import { db } from "../../lib/supabase-service";
import type { CorteRecord } from "../context/types";

export default function CorteCaja() {
  const { orders, gastos, abonos } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [corteType, setCorteType] = useState<"medio" | "final">("medio");
  const [cashCounted, setCashCounted] = useState("");
  const [historial, setHistorial] = useState<CorteRecord[]>([]);
  const [loadingCortes, setLoadingCortes] = useState(true);

  useEffect(() => {
    db.fetchCortes().then((cortes) => {
      setHistorial(cortes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }).finally(() => setLoadingCortes(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const todayOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = o.date.split("T")[0];
      return orderDate === today;
    });
  }, [orders, today]);

  const todayGastos = useMemo(() => {
    return gastos.filter((g) => g.date.split("T")[0] === today);
  }, [gastos, today]);

  const todayAbonos = useMemo(() => {
    return abonos.filter((a) => a.date.split("T")[0] === today);
  }, [abonos, today]);

  const efectivoVentas = todayOrders
    .filter((o) => o.paymentMethod === "Efectivo")
    .reduce((sum, o) => sum + o.total, 0);

  const tarjetaVentas = todayOrders
    .filter((o) => o.paymentMethod === "Tarjeta de Crédito/Débito")
    .reduce((sum, o) => sum + o.total, 0);

  const plataformaVentas = todayOrders
    .filter((o) => o.orderType === "uber" || o.orderType === "rappi")
    .reduce((sum, o) => sum + o.total, 0);

  const totalGastos = todayGastos.reduce((sum, g) => sum + g.amount, 0);
  const totalAbonos = todayAbonos.reduce((sum, a) => sum + a.amount, 0);
  const totalVentas = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const efectivoEnCaja = STARTING_CASH + efectivoVentas + totalAbonos - totalGastos;
  const counted = parseFloat(cashCounted) || 0;
  const difference = counted - efectivoEnCaja;

  const openCorteModal = (type: "medio" | "final") => {
    setCorteType(type);
    setCashCounted("");
    setShowModal(true);
  };

  const confirmCorte = async () => {
    const record: CorteRecord = {
      id: `CORTE-${Date.now()}`,
      type: corteType,
      date: new Date().toISOString(),
      cashCounted: counted,
      expectedCash: efectivoEnCaja,
      difference,
      summary: {
        efectivo: efectivoVentas,
        tarjeta: tarjetaVentas,
        plataformas: plataformaVentas,
        gastos: totalGastos,
        abonos: totalAbonos,
        totalVentas,
        cajaInicial: STARTING_CASH,
        efectivoEnCaja,
      },
    };
    setHistorial((prev) => [record, ...prev]);
    setShowModal(false);
    await db.saveCorte(record);
  };

  return (
    <div className="p-8 h-full overflow-auto bg-background text-foreground font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Corte de Caja</h1>
            <p className="text-gray-500 text-xs mt-1">
              Resumen del día {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openCorteModal("medio")}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4" /> Medio Corte
            </button>
            <button
              onClick={() => openCorteModal("final")}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Corte Final
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Ventas Totales</span>
              <DollarSign className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-2xl text-foreground font-light tracking-wide">{fmt(totalVentas)}</p>
            <p className="text-[10px] text-gray-500 mt-1">{todayOrders.length} pedidos realizados</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Efectivo en Caja</span>
              <Banknote className="w-4 h-4 text-green-500" strokeWidth={1.5} />
            </div>
            <p className="text-2xl text-green-500 font-light tracking-wide">{fmt(efectivoEnCaja)}</p>
            <p className="text-[10px] text-gray-500 mt-1">Fondo inicial: {fmt(STARTING_CASH)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Gastos del Día</span>
              <ArrowDownRight className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            </div>
            <p className="text-2xl text-red-500 font-light tracking-wide">-{fmt(totalGastos)}</p>
            <p className="text-[10px] text-gray-500 mt-1">{todayGastos.length} egresos registrados</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Abonos Recibidos</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
            </div>
            <p className="text-2xl text-emerald-400 font-light tracking-wide">+{fmt(totalAbonos)}</p>
            <p className="text-[10px] text-gray-500 mt-1">{todayAbonos.length} abonos de fiados</p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventas por Método de Pago */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold mb-5 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Ventas por Método de Pago
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/5">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-foreground font-semibold">Efectivo</span>
                </div>
                <span className="text-sm text-foreground font-bold">{fmt(efectivoVentas)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-foreground font-semibold">Tarjeta</span>
                </div>
                <span className="text-sm text-foreground font-bold">{fmt(tarjetaVentas)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border/5">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-foreground font-semibold">Plataformas (Uber/Rappi)</span>
                </div>
                <span className="text-sm text-foreground font-bold">{fmt(plataformaVentas)}</span>
              </div>
            </div>
          </div>

          {/* Cálculo de Caja */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold mb-5 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Cálculo de Efectivo
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Fondo de caja inicial:</span>
                <span className="text-foreground font-semibold">{fmt(STARTING_CASH)}</span>
              </div>
              <div className="flex justify-between text-green-500">
                <span>+ Ventas en efectivo:</span>
                <span className="font-semibold">{fmt(efectivoVentas)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>+ Abonos recibidos:</span>
                <span className="font-semibold">{fmt(totalAbonos)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>- Gastos / Egresos:</span>
                <span className="font-semibold">-{fmt(totalGastos)}</span>
              </div>
              <div className="border-t border-border pt-2.5 mt-2">
                <div className="flex justify-between text-sm text-[#b3922e] font-bold">
                  <span>Efectivo esperado en caja:</span>
                  <span>{fmt(efectivoEnCaja)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pedidos Recientes */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold mb-4">
            Pedidos de Hoy ({todayOrders.length})
          </h2>
          {todayOrders.length === 0 ? (
            <p className="text-xs text-gray-500 italic text-center py-6">No hay pedidos registrados hoy.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-gray-500 font-semibold">ID</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Tipo</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Método Pago</th>
                    <th className="text-left py-2 text-gray-500 font-semibold">Estado</th>
                    <th className="text-right py-2 text-gray-500 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {todayOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="py-2 font-mono text-foreground">{o.id.slice(-8)}</td>
                      <td className="py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          o.orderType === "uber" ? "bg-emerald-500/10 text-emerald-500" :
                          o.orderType === "rappi" ? "bg-orange-500/10 text-orange-500" :
                          o.orderType === "llevar" ? "bg-cyan-500/10 text-cyan-500" :
                          "bg-gray-500/10 text-gray-500"
                        }`}>
                          {o.orderType}
                        </span>
                      </td>
                      <td className="py-2 text-foreground">{o.paymentMethod}</td>
                      <td className="py-2">
                        <span className={`font-semibold uppercase ${
                          o.status === "completado" ? "text-green-500" :
                          o.status === "pendiente" ? "text-yellow-500" :
                          "text-red-500"
                        }`}>{o.status}</span>
                      </td>
                      <td className="py-2 text-right font-bold text-foreground">{fmt(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial de Cortes */}
        {historial.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold mb-4">
              Historial de Cortes de Hoy
            </h2>
            <div className="space-y-3">
              {historial.map((h) => (
                <div key={h.id} className={`p-4 rounded-lg border ${
                  h.type === "final"
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {h.type === "final" ? (
                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {h.type === "final" ? "Corte Final" : "Medio Corte"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(h.date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-[10px]">
                    <div>
                      <span className="text-gray-500">Efectivo contado:</span>
                      <p className="text-foreground font-bold text-xs">{fmt(h.cashCounted)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Efectivo esperado:</span>
                      <p className="text-foreground font-bold text-xs">{fmt(h.expectedCash)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Diferencia:</span>
                      <p className={`font-bold text-xs ${h.difference === 0 ? "text-green-500" : h.difference > 0 ? "text-emerald-400" : "text-red-500"}`}>
                        {h.difference === 0 ? "Cuadra" : `${h.difference > 0 ? "+" : ""}${fmt(h.difference)}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal Corte */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={corteType === "final" ? "Corte Final de Caja" : "Medio Corte"}>
        <ModalBody>
          {corteType === "final" && (
            <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-500">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              El corte final cerrará el turno del día. Asegúrate de contar el efectivo correctamente.
            </div>
          )}

          <div className="p-3 bg-background rounded-lg border border-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Efectivo esperado:</span>
              <span className="font-bold text-[#b3922e]">{fmt(efectivoEnCaja)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total ventas:</span>
              <span className="font-bold text-foreground">{fmt(totalVentas)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pedidos:</span>
              <span className="font-bold text-foreground">{todayOrders.length}</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">
              Efectivo contado en caja ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={cashCounted}
              onChange={(e) => setCashCounted(e.target.value)}
              className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {cashCounted && (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg text-[10px] font-semibold ${
              difference === 0
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : difference > 0
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}>
              {difference === 0 ? (
                <><CheckCircle2 className="w-4 h-4" /> La caja cuadra perfectamente</>
              ) : (
                <><AlertTriangle className="w-4 h-4" /> Diferencia: {difference > 0 ? "Sobran" : "Faltan"} {fmt(Math.abs(difference))}</>
              )}
            </div>
          )}

          <ModalFooter>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={confirmCorte}
              disabled={!cashCounted}
              className={`flex-1 py-2.5 text-white rounded-lg text-xs font-semibold tracking-wider transition-all ${
                corteType === "final"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-600 hover:bg-amber-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Confirmar {corteType === "final" ? "Corte" : "Medio Corte"}
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>

    </div>
  );
}
