import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Trash2, Plus, Minus, ShoppingCart, X, Banknote, CreditCard, Receipt, Search, UserPlus, FileText } from "lucide-react";
import { useApp, Cliente } from "../context/AppContext";

const paymentMethods = [
  { id: "efectivo", name: "Efectivo", icon: Banknote },
  { id: "tarjeta", name: "Tarjeta de Crédito/Débito", icon: CreditCard },
];

export default function Carrito() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartTotal,
    placeOrderDetailed,
    cartCount,
    clientes,
    addCliente,
    tables,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("efectivo");
  const [orderType, setOrderType] = useState<"local" | "llevar" | "domicilio" | "uber" | "rappi">("local");
  
  // Pre-selected table from route location state if came from MapaMesas
  const [selectedTable, setSelectedTable] = useState(() => {
    return routeLocation.state?.tableId || "A1";
  });

  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    total: number;
    tax: number;
    grandTotal: number;
    table?: string;
    method: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: string;
  } | null>(null);

  const [ticketNum] = useState(() => Math.floor(100000 + Math.random() * 900000));

  // Client search states (Domicilio)
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");

  // Client rápido state (Llevar)
  const [clientRapidoName, setClientRapidoName] = useState("Cliente General");

  const tax = cartTotal * 0.16;
  const grandTotal = cartTotal + tax;

  const handleSearchClient = () => {
    const found = clientes.find((c) => c.phone.includes(phoneSearch) || c.name.toLowerCase().includes(phoneSearch.toLowerCase()));
    if (found) {
      setSelectedCliente(found);
      setShowNewClientForm(false);
    } else {
      setSelectedCliente(null);
      setNewClientPhone(phoneSearch);
      setShowNewClientForm(true);
    }
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone || !newClientAddress) return;
    addCliente({
      name: newClientName,
      phone: newClientPhone,
      address: newClientAddress,
    });
    // Find latest added client (simulate or select right away)
    const mockCreatedClient = {
      id: `c_temp_${Date.now()}`,
      name: newClientName,
      phone: newClientPhone,
      address: newClientAddress,
    };
    setSelectedCliente(mockCreatedClient);
    setShowNewClientForm(false);
  };

  const handleConfirmOrder = () => {
    const method = paymentMethods.find((m) => m.id === selectedMethod)?.name || selectedMethod;
    
    // Determine client information based on orderType
    let cName = "";
    let cPhone = "";
    let cAddress = "";

    if (orderType === "domicilio") {
      cName = selectedCliente ? selectedCliente.name : "Cliente Domicilio";
      cPhone = selectedCliente ? selectedCliente.phone : "";
      cAddress = selectedCliente ? selectedCliente.address : "";
    } else if (orderType === "llevar") {
      cName = clientRapidoName || "Cliente General";
    } else if (orderType === "uber") {
      cName = "Pedido Uber Eats";
    } else if (orderType === "rappi") {
      cName = "Pedido Rappi";
    }

    setOrderSummary({
      total: cartTotal,
      tax: tax,
      grandTotal: grandTotal,
      table: orderType === "local" ? selectedTable : undefined,
      method: method,
      clientName: cName || undefined,
      clientPhone: cPhone || undefined,
      clientAddress: cAddress || undefined,
      notes: notes || undefined,
      orderType: orderType,
    });

    placeOrderDetailed({
      paymentMethod: method,
      table: orderType === "local" ? selectedTable : undefined,
      clientName: cName || undefined,
      clientPhone: cPhone || undefined,
      clientAddress: cAddress || undefined,
      notes: notes || undefined,
      orderType: orderType,
    });

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
          <p className="text-gray-500 text-sm leading-relaxed">
            El pedido ({orderSummary.orderType.toUpperCase()}) ha sido registrado con éxito. 
            Imprima el ticket físico y entréguelo al repartidor o cliente.
          </p>
        </div>

        {/* Ticket Mockup / Details */}
        <div className="w-full bg-[#0f0f0f] border border-border rounded-xl p-5 text-left font-mono text-xs text-gray-400 space-y-2.5 shadow-sm">
          <div className="flex justify-between border-b border-border pb-2">
            <span>EL PULPAZO - TICKET</span>
            <span className="text-white">#{ticketNum}</span>
          </div>
          <div className="flex justify-between">
            <span>Tipo Pedido:</span>
            <span className="text-white uppercase font-bold">{orderSummary.orderType}</span>
          </div>
          {orderSummary.table && (
            <div className="flex justify-between">
              <span>Mesa:</span>
              <span className="text-white font-bold">{orderSummary.table}</span>
            </div>
          )}
          {orderSummary.clientName && (
            <div className="border-t border-border/10 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="text-white">{orderSummary.clientName}</span>
              </div>
              {orderSummary.clientPhone && (
                <div className="flex justify-between">
                  <span>Teléfono:</span>
                  <span className="text-white">{orderSummary.clientPhone}</span>
                </div>
              )}
              {orderSummary.clientAddress && (
                <div className="flex flex-col text-[10px] mt-1 bg-background p-1.5 rounded border border-border/5">
                  <span className="text-gray-500">Dirección de Entrega:</span>
                  <span className="text-white mt-0.5">{orderSummary.clientAddress}</span>
                </div>
              )}
            </div>
          )}
          
          {orderSummary.notes && (
            <div className="border-t border-border/10 pt-2 text-[10px] text-yellow-500/90 italic">
              <span className="font-bold uppercase not-italic block text-[9px] text-gray-500 mb-0.5">Notas de Cocina:</span>
              "{orderSummary.notes}"
            </div>
          )}

          <div className="flex justify-between border-t border-border/20 pt-2">
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
          <div className="flex justify-between border-t border-dashed border-border/30 pt-2 text-sm text-[#D4AF37] font-bold">
            <span>TOTAL:</span>
            <span>${orderSummary.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setOrderSummary(null);
            setNotes("");
            setSelectedCliente(null);
            setPhoneSearch("");
            navigate("/dashboard/cliente-menu");
          }}
          className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer"
        >
          Entregar Ticket y Regresar
        </button>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
        </div>
        <p className="text-foreground tracking-wide font-medium">Tu carrito está vacío</p>
        <p className="text-gray-500 text-sm">Agrega platillos desde el menú de la marisquería</p>
        <button onClick={() => navigate("/dashboard/cliente-menu")}
          className="mt-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-sm font-semibold transition-colors tracking-wide cursor-pointer">
          Ir al Menú
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-8 h-full overflow-auto bg-background text-foreground transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
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
                <div key={item.id} className="bg-card border border-border rounded-xl p-4 flex gap-4 shadow-sm">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold mb-0.5 truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">{item.category}</p>
                    <p className="text-[#b3922e] font-semibold text-sm mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-[#ef4444] transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md border border-border text-foreground hover:bg-background flex items-center justify-center transition-colors cursor-pointer">
                        <Minus className="w-3 h-3" strokeWidth={2} />
                      </button>
                      <span className="text-foreground text-sm w-4 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md border border-border text-foreground hover:bg-background flex items-center justify-center transition-colors cursor-pointer">
                        <Plus className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Notes for Kitchen */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <label className="text-xs tracking-widest text-gray-500 uppercase font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D4AF37]" /> Comentarios de Preparación (Cocina)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Alergia a mariscos (camarón), sin cebolla en las tostadas, michelada bien fría..."
                  className="w-full h-20 bg-background border border-border rounded-lg p-3 text-foreground placeholder:text-gray-500 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Summary / Order Type Panel */}
            <div className="space-y-4">
              {/* Tipo de Pedido */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Tipo de Pedido</p>
                <select
                  value={orderType}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    setOrderType(type);
                    // Automatic payment selection for delivery platforms
                    if (type === "uber" || type === "rappi") {
                      setSelectedMethod("tarjeta");
                    }
                  }}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs font-semibold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="local">Mesa (Local)</option>
                  <option value="llevar">Para Llevar (Cliente Rápido)</option>
                  <option value="domicilio">A Domicilio (Reparto)</option>
                  <option value="uber">Plataforma Uber Eats</option>
                  <option value="rappi">Plataforma Rappi</option>
                </select>

                {/* Sub-inputs based on orderType */}
                {orderType === "local" && (
                  <div className="pt-2">
                    <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Seleccionar Mesa</label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.status.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {orderType === "llevar" && (
                  <div className="pt-2">
                    <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Nombre Cliente Rápido</label>
                    <input
                      type="text"
                      value={clientRapidoName}
                      onChange={(e) => setClientRapidoName(e.target.value)}
                      placeholder="Ej. Juan de Paso"
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}

                {orderType === "domicilio" && (
                  <div className="pt-2 space-y-3">
                    <label className="block text-[10px] tracking-widest text-gray-500 uppercase font-semibold">Buscar / Registrar Cliente</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Teléfono o Nombre..."
                          value={phoneSearch}
                          onChange={(e) => setPhoneSearch(e.target.value)}
                          className="w-full bg-background border border-border rounded-lg py-1.5 pl-8 pr-3 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearchClient}
                        className="bg-[#D4AF37] hover:bg-[#C9A830] text-black text-[10px] font-bold px-3 rounded-lg flex items-center justify-center cursor-pointer"
                      >
                        Buscar
                      </button>
                    </div>

                    {/* Selected Client Info */}
                    {selectedCliente && (
                      <div className="bg-background border border-[#D4AF37]/35 rounded-lg p-3 text-xs space-y-1">
                        <p className="text-foreground font-bold">{selectedCliente.name}</p>
                        <p className="text-gray-500 font-mono text-[10px]">{selectedCliente.phone}</p>
                        <p className="text-gray-500 text-[10px] italic leading-tight">{selectedCliente.address}</p>
                        <button
                          type="button"
                          onClick={() => setSelectedCliente(null)}
                          className="text-[9px] text-[#ef4444] hover:underline block pt-1.5"
                        >
                          Deseleccionar Cliente
                        </button>
                      </div>
                    )}

                    {/* Create New Client Form */}
                    {showNewClientForm && (
                      <form onSubmit={handleSaveClient} className="bg-background border border-border rounded-lg p-3 space-y-2.5">
                        <p className="text-[10px] font-bold text-[#D4AF37] flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> Registrar Cliente Domicilio
                        </p>
                        <input
                          type="text"
                          required
                          placeholder="Nombre Completo"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Número Telefónico"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                          className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                        <textarea
                          required
                          placeholder="Dirección Completa (Calle, No, Colonia)"
                          value={newClientAddress}
                          onChange={(e) => setNewClientAddress(e.target.value)}
                          className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-[#D4AF37] h-12"
                        />
                        <button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          Guardar y Seleccionar
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {(orderType === "uber" || orderType === "rappi") && (
                  <div className="p-2.5 bg-background border border-border rounded-lg text-[10px] text-gray-500 leading-relaxed">
                    Los pedidos de plataformas se envían directamente a cocina y se liquidarán bajo método digital en el corte.
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Resumen</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-foreground font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA (16%)</span>
                  <span className="text-foreground font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-[#b3922e] text-sm tracking-wide font-bold">Total</span>
                  <span className="text-[#b3922e] font-bold">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Disable checkout for delivery without client */}
              <button
                disabled={orderType === "domicilio" && !selectedCliente}
                onClick={() => setShowPayment(true)}
                className="w-full bg-[#D4AF37] hover:bg-[#C9A830] disabled:bg-gray-300 disabled:text-gray-500 text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer shadow"
              >
                {orderType === "domicilio" && !selectedCliente ? "Selecciona un cliente" : "Proceder al Pago"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-sm tracking-[0.18em] text-[#D4AF37] uppercase font-semibold">Forma de Pago</h2>
              <button onClick={() => setShowPayment(false)} className="text-gray-500 hover:text-foreground transition-colors cursor-pointer">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const active = selectedMethod === pm.id;
                return (
                  <button key={pm.id} onClick={() => setSelectedMethod(pm.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                      active ? "border-[#D4AF37] bg-[#D4AF37]/8" : "border-border hover:border-gray-300"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-[#D4AF37]/20" : "bg-background border border-border"}`}>
                      <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <span className={`text-sm font-semibold ${active ? "text-foreground" : "text-gray-500"}`}>{pm.name}</span>
                    {active && <div className="ml-auto w-2 h-2 rounded-full bg-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>

            {/* Order total + confirm */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="text-gray-500 text-sm">Total a pagar</span>
                <span className="text-[#b3922e] font-bold text-lg">${grandTotal.toFixed(2)}</span>
              </div>
              <button onClick={handleConfirmOrder}
                className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer shadow-md">
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
