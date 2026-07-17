import { useState } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingCart, X, Banknote, CreditCard, Receipt } from "lucide-react";
import { useApp } from "../context/AppContext";

const paymentMethods = [
  { id: "efectivo", name: "Efectivo", icon: Banknote },
  { id: "tarjeta", name: "Tarjeta de Crédito/Débito", icon: CreditCard },
];

export default function Carrito() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, placeOrder, cartCount } = useApp();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("efectivo");
  const [selectedTable, setSelectedTable] = useState("A1");
  const [success, setSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{ total: number; tax: number; grandTotal: number; table: string; method: string } | null>(null);
  const [ticketNum] = useState(() => Math.floor(100000 + Math.random() * 900000));

  const tax = cartTotal * 0.16;
  const grandTotal = cartTotal + tax;

  const handleConfirmOrder = () => {
    const method = paymentMethods.find((m) => m.id === selectedMethod)?.name || selectedMethod;
    setOrderSummary({
      total: cartTotal,
      tax: cartTotal * 0.16,
      grandTotal: cartTotal * 1.16,
      table: selectedTable,
      method: method,
    });
    placeOrder(method, selectedTable);
    setShowPayment(false);
    setSuccess(true);
  };

  if (success && orderSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto px-6 py-12 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center animate-pulse">
          <Receipt className="w-10 h-10 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl text-[#D4AF37] tracking-wider uppercase font-semibold">Esperando Ticket de Compra</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            El pedido para la <span className="text-[#D4AF37] font-semibold">Mesa {orderSummary.table}</span> ha sido registrado con éxito. 
            Imprima el ticket físico y entréguelo al cliente.
          </p>
        </div>

        {/* Ticket Mockup / Details */}
        <div className="w-full bg-[#0d0d0d] border border-[#D4AF37]/15 rounded-xl p-5 text-left font-mono text-xs text-gray-400 space-y-2">
          <div className="flex justify-between border-b border-[#D4AF37]/10 pb-2">
            <span>TICKET DE COMPRA</span>
            <span className="text-white">#{ticketNum}</span>
          </div>
          <div className="flex justify-between">
            <span>Mesa:</span>
            <span className="text-white">{orderSummary.table}</span>
          </div>
          <div className="flex justify-between">
            <span>Método Pago:</span>
            <span className="text-white">{orderSummary.method}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="text-white">${orderSummary.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <span className="text-white">${orderSummary.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-[#D4AF37]/20 pt-2 text-sm text-[#D4AF37] font-bold">
            <span>TOTAL:</span>
            <span>${orderSummary.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setOrderSummary(null);
            navigate("/dashboard/cliente-menu");
          }}
          className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors"
        >
          Entregar Ticket y Regresar
        </button>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
          <ShoppingCart className="w-7 h-7 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-white tracking-wide">Tu carrito está vacío</p>
        <p className="text-gray-500 text-sm">Agrega platillos desde el menú del cliente</p>
        <button onClick={() => navigate("/dashboard/cliente-menu")}
          className="mt-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-sm font-medium transition-colors tracking-wide">
          Ir al Menú
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 h-full overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl text-[#D4AF37] tracking-wide">Carrito de Pedido</h1>
              <p className="text-gray-500 text-sm mt-1">{cartCount} {cartCount === 1 ? "platillo" : "platillos"} seleccionados</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-[#111] border border-[#D4AF37]/15 rounded-xl p-4 flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm mb-0.5 truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.category}</p>
                    <p className="text-[#D4AF37] text-sm mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-600 hover:text-[#ef4444] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-colors">
                        <Minus className="w-3 h-3" strokeWidth={2} />
                      </button>
                      <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Mesa */}
              <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5">
                <p className="text-xs tracking-widest text-gray-500 uppercase mb-3">Mesa</p>
                <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 px-3 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors">
                  {["A1","A4","B1","B3","C2","C4","D2","D4"].map((t) => (
                    <option key={t} value={t}>Mesa {t}</option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 space-y-3">
                <p className="text-xs tracking-widest text-gray-500 uppercase mb-1">Resumen</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">IVA (16%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#D4AF37]/15 pt-3 flex justify-between">
                  <span className="text-[#D4AF37] text-sm tracking-wide">Total</span>
                  <span className="text-[#D4AF37] font-semibold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={() => setShowPayment(true)}
                className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors">
                Proceder al Pago
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#111] rounded-2xl border border-[#D4AF37]/30 overflow-hidden"
            style={{ boxShadow: "0 0 48px rgba(0,0,0,0.8)" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/15">
              <h2 className="text-sm tracking-[0.18em] text-[#D4AF37] uppercase">Forma de Pago</h2>
              <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const active = selectedMethod === pm.id;
                return (
                  <button key={pm.id} onClick={() => setSelectedMethod(pm.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                      active ? "border-[#D4AF37] bg-[#D4AF37]/8" : "border-[#D4AF37]/15 hover:border-[#D4AF37]/35"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-[#D4AF37]/20" : "bg-[#D4AF37]/5"}`}>
                      <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <span className={`text-sm ${active ? "text-white" : "text-gray-400"}`}>{pm.name}</span>
                    {active && <div className="ml-auto w-2 h-2 rounded-full bg-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>

            {/* Order total + confirm */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center border-t border-[#D4AF37]/15 pt-4">
                <span className="text-gray-400 text-sm">Total a pagar</span>
                <span className="text-[#D4AF37] font-semibold">${grandTotal.toFixed(2)}</span>
              </div>
              <button onClick={handleConfirmOrder}
                className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors">
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
