import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingCart, X, Banknote, CreditCard, Receipt, Search, UserPlus, FileText, Smartphone, Wallet, Bike, Tag, SplitSquareHorizontal } from "lucide-react";
import { useApp, Cliente } from "../context/AppContext";
import { Modal, ModalBody } from "./ui/Modal";

const paymentMethods = [
  { id: "efectivo", name: "Efectivo", icon: Banknote },
  { id: "tarjeta", name: "Tarjeta de Crédito/Débito", icon: CreditCard },
];

export default function Carrito() {
  const navigate = useNavigate();
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
    currentTableId,
    repartidores,
    addEntrega,
    updateRepartidor,
    findDescuentoByCode,
    incrementarUso,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("efectivo");
  const [orderType, setOrderType] = useState<"local" | "llevar" | "domicilio" | "uber" | "rappi">("local");
  
  // Pre-selected table from context (set by MapaMesas) or default
  const [selectedTable, setSelectedTable] = useState(() => {
    return currentTableId || "A1";
  });

  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderSummary, setOrderSummary] = useState<{
    total: number;
    discount: number;
    tax: number;
    grandTotal: number;
    table?: string;
    method: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: string;
    cashGiven: number;
    cambio: number;
    couponCode?: string;
  } | null>(null);

  const [ticketNum] = useState(() => Math.floor(100000 + Math.random() * 900000));

  // Client search states (Domicilio)
  const [phoneSearch, setPhoneSearch] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientStreet, setNewClientStreet] = useState("");
  const [newClientNumber, setNewClientNumber] = useState("");
  const [newClientNeighborhood, setNewClientNeighborhood] = useState("");
  const [newClientColony, setNewClientColony] = useState("");
  const [newClientPostalCode, setNewClientPostalCode] = useState("");
  const [newClientReference, setNewClientReference] = useState("");
  const [newClientPayment, setNewClientPayment] = useState<"Efectivo" | "Tarjeta de Crédito/Débito">("Efectivo");
  const [newClientNotes, setNewClientNotes] = useState("");

  // Repartidor selection (Domicilio)
  const [selectedRepartidorId, setSelectedRepartidorId] = useState("");

  // Coupon / Discount state
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscountId, setAppliedDiscountId] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState("");

  // Client rápido state (Llevar)
  const [clientRapidoName, setClientRapidoName] = useState("Cliente General");

  // Cash payment states
  const [cashGiven, setCashGiven] = useState("");

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedDiscountId) return 0;
    const desc = findDescuentoByCode(couponCode);
    if (!desc || desc.id !== appliedDiscountId) return 0;
    if (desc.tipo === "porcentaje") {
      return Math.min(cartTotal * (desc.valor / 100), cartTotal);
    }
    return Math.min(desc.valor, cartTotal);
  }, [appliedDiscountId, couponCode, cartTotal, findDescuentoByCode]);

  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const tax = subtotalAfterDiscount * 0.16;
  const grandTotal = subtotalAfterDiscount + tax;
  const cashAmount = parseFloat(cashGiven) || 0;
  const cambio = cashAmount - grandTotal;

  const handleApplyCoupon = () => {
    setDiscountError("");
    if (!couponCode.trim()) {
      setAppliedDiscountId(null);
      return;
    }
    const desc = findDescuentoByCode(couponCode.trim());
    if (!desc) {
      setDiscountError("Cupón no encontrado o inactivo");
      setAppliedDiscountId(null);
      return;
    }
    if (desc.minPedido > 0 && cartTotal < desc.minPedido) {
      setDiscountError(`Pedido mínimo: $${desc.minPedido}`);
      setAppliedDiscountId(null);
      return;
    }
    if (desc.usosMaximos > 0 && desc.usosActuales >= desc.usosMaximos) {
      setDiscountError("Cupón agotado");
      setAppliedDiscountId(null);
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    if (desc.validoDesde && now < desc.validoDesde) {
      setDiscountError("Cupón aún no es válido");
      setAppliedDiscountId(null);
      return;
    }
    if (desc.validoHasta && now > desc.validoHasta) {
      setDiscountError("Cupón expirado");
      setAppliedDiscountId(null);
      return;
    }
    setAppliedDiscountId(desc.id);
    setDiscountError("");
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscountId(null);
    setDiscountError("");
  };

  const handleSearchClient = () => {
    const found = clientes.find((c) => c.phone.includes(phoneSearch) || c.name.toLowerCase().includes(phoneSearch.toLowerCase()));
    if (found) {
      setSelectedCliente(found);
      setShowNewClientForm(false);
      if (found.defaultPayment === "Tarjeta de Crédito/Débito") {
        setSelectedMethod("tarjeta");
      } else {
        setSelectedMethod("efectivo");
      }
    } else {
      setSelectedCliente(null);
      setNewClientPhone(phoneSearch);
      setShowNewClientForm(true);
    }
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPhone) return;
    const fullAddress = `${newClientStreet} ${newClientNumber}, ${newClientNeighborhood}, ${newClientColony} ${newClientPostalCode}`.trim();
    addCliente({
      name: newClientName,
      phone: newClientPhone,
      address: fullAddress || newClientAddress,
      street: newClientStreet,
      number: newClientNumber,
      neighborhood: newClientNeighborhood,
      colony: newClientColony,
      postalCode: newClientPostalCode,
      reference: newClientReference,
      defaultPayment: newClientPayment,
      notes: newClientNotes,
    });
    const mockCreatedClient = {
      id: `c_temp_${Date.now()}`,
      name: newClientName,
      phone: newClientPhone,
      address: fullAddress || newClientAddress,
      street: newClientStreet,
      number: newClientNumber,
      neighborhood: newClientNeighborhood,
      colony: newClientColony,
      postalCode: newClientPostalCode,
      reference: newClientReference,
      defaultPayment: newClientPayment,
      notes: newClientNotes,
    };
    setSelectedCliente(mockCreatedClient);
    setShowNewClientForm(false);
    setNewClientName(""); setNewClientPhone(""); setNewClientAddress("");
    setNewClientStreet(""); setNewClientNumber(""); setNewClientNeighborhood("");
    setNewClientColony(""); setNewClientPostalCode(""); setNewClientReference("");
    setNewClientPayment("Efectivo"); setNewClientNotes("");
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

    // Generate order ID upfront for delivery assignment
    const orderId = `ORD-${Date.now()}`;

    setOrderSummary({
      total: cartTotal,
      discount: discountAmount,
      tax: tax,
      grandTotal: grandTotal,
      table: orderType === "local" ? selectedTable : undefined,
      method: method,
      clientName: cName || undefined,
      clientPhone: cPhone || undefined,
      clientAddress: cAddress || undefined,
      notes: notes || undefined,
      orderType: orderType,
      cashGiven: selectedMethod === "efectivo" ? cashAmount : 0,
      cambio: selectedMethod === "efectivo" ? (cambio > 0 ? cambio : 0) : 0,
      couponCode: appliedDiscountId ? couponCode : undefined,
    });

    placeOrderDetailed({
      paymentMethod: method,
      table: orderType === "local" ? selectedTable : undefined,
      clientName: cName || undefined,
      clientPhone: cPhone || undefined,
      clientAddress: cAddress || undefined,
      notes: notes || undefined,
      orderType: orderType,
      descuento: discountAmount > 0 ? discountAmount : undefined,
    });

    // Increment discount usage
    if (appliedDiscountId) {
      incrementarUso(appliedDiscountId);
    }

    // Create delivery assignment if repartidor selected for domicilio
    if (orderType === "domicilio" && selectedRepartidorId) {
      const now = new Date();
      addEntrega({
        id: `er${Date.now()}`,
        repartidorId: selectedRepartidorId,
        orderId: orderId,
        estatus: "asignado",
        fecha: now.toISOString().split("T")[0],
        hora: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        direccion: cAddress || "",
        notas: notes || "",
      });
      const rp = repartidores.find(r => r.id === selectedRepartidorId);
      if (rp) {
        updateRepartidor({ ...rp, estatus: "en_entrega" });
      }
    }

    setShowPayment(false);
    setSuccess(true);
  };

  if (success && orderSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto px-6 py-12 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/35 flex items-center justify-center animate-pulse">
          <Receipt className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl text-primary tracking-wider uppercase font-semibold">Esperando Ticket de Compra</h2>
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
          {orderSummary.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Descuento ({orderSummary.couponCode}):</span>
              <span>-${orderSummary.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>IVA (16%):</span>
            <span className="text-white">${orderSummary.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-border/30 pt-2 text-sm text-primary font-bold">
            <span>TOTAL:</span>
            <span>${orderSummary.grandTotal.toFixed(2)}</span>
          </div>
          {orderSummary.method === "Efectivo" && orderSummary.cashGiven > 0 && (
            <>
              <div className="flex justify-between text-green-500">
                <span>Efectivo Recibido:</span>
                <span>${orderSummary.cashGiven.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-primary font-bold">
                <span>Cambio:</span>
                <span>${orderSummary.cambio.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => {
            setSuccess(false);
            setOrderSummary(null);
            setNotes("");
            setSelectedCliente(null);
            setPhoneSearch("");
            setCouponCode("");
            setAppliedDiscountId(null);
            setDiscountError("");
            navigate("/dashboard/cliente-menu");
          }}
          className="w-full bg-primary hover:bg-[#C9A830] text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer shadow"
        >
          Entregar Ticket y Regresar
        </button>

        {orderSummary.grandTotal > 100 && (
          <button
            onClick={() => {
              setSuccess(false);
              setOrderSummary(null);
              setNotes("");
              setSelectedCliente(null);
              setPhoneSearch("");
              setCouponCode("");
              setAppliedDiscountId(null);
              setDiscountError("");
              navigate("/dashboard/dividir-cuenta");
            }}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <SplitSquareHorizontal className="w-4 h-4" /> Dividir Cuenta
          </button>
        )}
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto px-6 text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-foreground tracking-wide font-medium">Tu carrito está vacío</p>
        <p className="text-gray-500 text-sm">Agrega platillos desde el menú de la marisquería</p>
        <button onClick={() => navigate("/dashboard/cliente-menu")}
          className="mt-2 px-6 py-2.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-sm font-semibold transition-colors tracking-wide cursor-pointer">
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
              <h1 className="text-2xl text-primary tracking-wide">Carrito de Pedido</h1>
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
                  <FileText className="w-4 h-4 text-primary" /> Comentarios de Preparación (Cocina)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Alergia a mariscos (camarón), sin cebolla en las tostadas, michelada bien fría..."
                  className="w-full h-20 bg-background border border-border rounded-lg p-3 text-foreground placeholder:text-gray-500 text-xs focus:outline-none focus:border-primary"
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
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
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
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
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
                      className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
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
                          className="w-full bg-background border border-border rounded-lg py-1.5 pl-8 pr-3 text-foreground text-xs focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearchClient}
                        className="bg-primary hover:bg-[#C9A830] text-black text-[10px] font-bold px-3 rounded-lg flex items-center justify-center cursor-pointer"
                      >
                        Buscar
                      </button>
                    </div>

                    {/* Selected Client Info */}
                    {selectedCliente && (
                      <div className="bg-background border border-primary/35 rounded-lg p-3 text-xs space-y-1">
                        <p className="text-foreground font-bold">{selectedCliente.name}</p>
                        <p className="text-gray-500 font-mono text-[10px]">{selectedCliente.phone}</p>
                        <p className="text-gray-500 text-[10px] italic leading-tight">{selectedCliente.address}</p>
                        {selectedCliente.reference && <p className="text-gray-400 text-[9px]">Ref: {selectedCliente.reference}</p>}
                        {selectedCliente.defaultPayment && (
                          <p className="text-[9px] text-primary font-semibold">Pago habitual: {selectedCliente.defaultPayment}</p>
                        )}
                        {selectedCliente.notes && <p className="text-[9px] text-gray-400 italic">{selectedCliente.notes}</p>}
                        <button type="button" onClick={() => setSelectedCliente(null)} className="text-[9px] text-[#ef4444] hover:underline block pt-1.5">
                          Deseleccionar Cliente
                        </button>
                      </div>
                    )}

                    {/* Create New Client Form */}
                    {showNewClientForm && (
                      <form onSubmit={handleSaveClient} className="bg-background border border-border rounded-lg p-3 space-y-2.5">
                        <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                          <UserPlus className="w-3.5 h-3.5" /> Registrar Cliente Domicilio
                        </p>
                        <input type="text" required placeholder="Nombre Completo" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        <input type="text" required placeholder="Número Telefónico" value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        <div className="grid grid-cols-3 gap-2">
                          <input type="text" required placeholder="Calle" value={newClientStreet} onChange={(e) => setNewClientStreet(e.target.value)} className="bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                          <input type="text" required placeholder="N°" value={newClientNumber} onChange={(e) => setNewClientNumber(e.target.value)} className="bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                          <input type="text" placeholder="C.P." value={newClientPostalCode} onChange={(e) => setNewClientPostalCode(e.target.value)} className="bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Colonia" value={newClientNeighborhood} onChange={(e) => setNewClientNeighborhood(e.target.value)} className="bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                          <input type="text" placeholder="Fracc./Zona" value={newClientColony} onChange={(e) => setNewClientColony(e.target.value)} className="bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        </div>
                        <input type="text" placeholder="Referencia (Frente al Oxxo, casa azul...)" value={newClientReference} onChange={(e) => setNewClientReference(e.target.value)} className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        <select value={newClientPayment} onChange={(e) => setNewClientPayment(e.target.value as any)} className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                          <option value="Efectivo">Pago habitual: Efectivo</option>
                          <option value="Tarjeta de Crédito/Débito">Pago habitual: Tarjeta</option>
                        </select>
                        <input type="text" placeholder="Notas (alergias, preferencias...)" value={newClientNotes} onChange={(e) => setNewClientNotes(e.target.value)} className="w-full bg-card border border-border rounded-md py-1 px-2.5 text-foreground text-xs focus:outline-none focus:border-primary" />
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1.5 rounded-md transition-colors cursor-pointer">
                          Guardar y Seleccionar
                        </button>
                      </form>
                    )}

                    {/* Repartidor Selector */}
                    <div className="pt-1">
                      <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Repartidor (Opcional)</label>
                      <select
                        value={selectedRepartidorId}
                        onChange={(e) => setSelectedRepartidorId(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="">Sin asignar (asignar después)</option>
                        {repartidores
                          .filter(r => r.estatus === "disponible" && r.activo)
                          .map(r => (
                            <option key={r.id} value={r.id}>{r.nombre} ({r.vehiculo})</option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {(orderType === "uber" || orderType === "rappi") && (
                  <div className="p-2.5 bg-background border border-border rounded-lg text-[10px] text-gray-500 leading-relaxed">
                    Los pedidos de plataformas se envían directamente a cocina y se liquidarán bajo método digital en el corte.
                  </div>
                )}
              </div>

              {/* Coupon Code */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
                <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" /> Cupón de Descuento
                </p>
                {appliedDiscountId ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-mono text-xs font-bold">{couponCode.toUpperCase()}</span>
                      <span className="text-green-400 text-xs">-${discountAmount.toFixed(2)}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-gray-500 hover:text-red-400 text-xs cursor-pointer">✕</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Código de cupón" maxLength={20}
                      className="flex-1 bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs font-mono focus:outline-none focus:border-primary" />
                    <button onClick={handleApplyCoupon}
                      className="px-3 py-2 bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors cursor-pointer">
                      Aplicar
                    </button>
                  </div>
                )}
                {discountError && <p className="text-red-400 text-[10px]">{discountError}</p>}
              </div>

              {/* Totals */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
                <p className="text-xs tracking-widest text-gray-500 uppercase font-semibold">Resumen</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-foreground font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Descuento ({couponCode.toUpperCase()})</span>
                    <span className="text-green-400 font-semibold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
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
                className="w-full bg-primary hover:bg-[#C9A830] disabled:bg-gray-300 disabled:text-gray-500 text-black py-3.5 rounded-xl text-sm tracking-[0.15em] uppercase font-semibold transition-colors cursor-pointer shadow"
              >
                {orderType === "domicilio" && !selectedCliente ? "Selecciona un cliente" : "Proceder al Pago"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="Forma de Pago" maxWidth="md" variant="bottom">
        <ModalBody>
          <div className="space-y-4">
            {/* Payment Method Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Efectivo */}
              <button
                onClick={() => setSelectedMethod("efectivo")}
                className={`relative flex flex-col items-center gap-2.5 px-4 py-5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === "efectivo"
                    ? "border-green-500 bg-green-500/8 shadow-md shadow-green-500/10"
                    : "border-border hover:border-gray-300 bg-background"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMethod === "efectivo" ? "bg-green-500/15" : "bg-background border border-border"
                }`}>
                  <Banknote className="w-6 h-6 text-green-500" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedMethod === "efectivo" ? "text-green-500" : "text-foreground"}`}>Efectivo</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Pago en efectivo</p>
                </div>
                {selectedMethod === "efectivo" && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Tarjeta */}
              <button
                onClick={() => setSelectedMethod("tarjeta")}
                className={`relative flex flex-col items-center gap-2.5 px-4 py-5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedMethod === "tarjeta"
                    ? "border-blue-500 bg-blue-500/8 shadow-md shadow-blue-500/10"
                    : "border-border hover:border-gray-300 bg-background"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedMethod === "tarjeta" ? "bg-blue-500/15" : "bg-background border border-border"
                }`}>
                  <CreditCard className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedMethod === "tarjeta" ? "text-blue-500" : "text-foreground"}`}>Tarjeta</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Crédito / Débito</p>
                </div>
                {selectedMethod === "tarjeta" && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {/* Efectivo: Quick Cash & Input */}
            {selectedMethod === "efectivo" && (
              <div className="bg-background border border-border rounded-xl p-4 space-y-3.5">
                <p className="text-[10px] tracking-widest text-gray-500 uppercase font-bold">Efectivo Recibido</p>
                
                {/* Quick amount buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setCashGiven(String(amt))}
                      className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        cashAmount === amt
                          ? "bg-green-500/15 border-green-500/40 text-green-500"
                          : "bg-card border-border text-gray-400 hover:border-green-500/30 hover:text-green-500"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                {/* Exact amount button */}
                <button
                  onClick={() => setCashGiven(String(grandTotal.toFixed(2)))}
                  className="w-full py-2 rounded-lg text-[10px] font-semibold border border-dashed border-border text-gray-500 hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
                >
                  Pago exacto: ${grandTotal.toFixed(2)}
                </button>

                {/* Manual input */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl py-3 pl-8 pr-4 text-foreground text-lg font-bold focus:outline-none focus:border-green-500 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Change indicator */}
                {cashAmount > 0 && (
                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                    cambio >= 0
                      ? "bg-green-500/10 border border-green-500/25 text-green-500"
                      : "bg-red-500/10 border border-red-500/25 text-red-500"
                  }`}>
                    <span className="flex items-center gap-2">
                      {cambio >= 0 ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[10px]">!</span>
                      )}
                      {cambio >= 0 ? "Cambio:" : "Faltan:"}
                    </span>
                    <span className="text-lg">${Math.abs(cambio).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tarjeta: Card info */}
            {selectedMethod === "tarjeta" && (
              <div className="bg-background border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-bold">Pago con Terminal</p>
                    <p className="text-gray-500 text-[10px]">Cobra con el terminal de tarjeta</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-3 text-[10px] text-gray-500 leading-relaxed">
                  Selecciona "Confirmar Pedido" para generar el ticket. Cobra al cliente con el terminal Point y registra el cobro en el corte de caja.
                </div>
              </div>
            )}

            {/* Total & Confirm */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-gray-500 text-sm">Total a pagar</span>
                <span className="text-primary font-bold text-xl">${grandTotal.toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleConfirmOrder}
                disabled={selectedMethod === "efectivo" && cashAmount < grandTotal}
                className={`w-full py-4 rounded-xl text-sm tracking-[0.15em] uppercase font-bold transition-all cursor-pointer shadow-lg ${
                  selectedMethod === "efectivo" && cashAmount < grandTotal
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-primary hover:bg-[#C9A830] text-black hover:shadow-primary/25"
                }`}
              >
                {selectedMethod === "efectivo" && cashAmount < grandTotal
                  ? `Faltan $${(grandTotal - cashAmount).toFixed(2)}`
                  : "Confirmar Pedido"
                }
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
