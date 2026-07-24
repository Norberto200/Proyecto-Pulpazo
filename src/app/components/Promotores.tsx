import { useState, useMemo } from "react";
import {
  Plus, X, Truck, Package, Calendar, Clock, CheckCircle2,
  Search, Edit2, Trash2, Phone, User, Tag, ArrowDownRight, ArrowUpRight,
} from "lucide-react";
import { useApp, Promotor, Entrega } from "../context/AppContext";
import { Modal, ModalBody, ModalFooter } from "./ui/Modal";
import { db } from "../../lib/supabase-service";

const PROMOTOR_TYPES = ["Coca-Cola", "Pepsi", "Pescaderia", "Cerveceria", "Otro"] as const;

const TYPE_COLORS: Record<string, string> = {
  "Coca-Cola": "bg-red-500/10 text-red-500 border border-red-500/20",
  "Pepsi": "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  "Pescaderia": "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
  "Cerveceria": "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  "Otro": "bg-gray-500/10 text-gray-500 border border-gray-500/20",
};

const STATUS_STYLES: Record<string, string> = {
  pendiente: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  en_camino: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  entregado: "bg-green-500/10 text-green-500 border border-green-500/20",
  cancelado: "bg-red-500/10 text-red-500 border border-red-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_camino: "En Camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export default function Promotores() {
  const { promotores, setPromotores, entregas, setEntregas } = useApp();
  const [activeTab, setActiveTab] = useState<"promotores" | "entregas" | "calendario">("promotores");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddPromotor, setShowAddPromotor] = useState(false);
  const [showAddEntrega, setShowAddEntrega] = useState(false);
  const [editingPromotor, setEditingPromotor] = useState<Promotor | null>(null);

  // Form states - Promotor
  const [pName, setPName] = useState("");
  const [pBrand, setPBrand] = useState("");
  const [pContact, setPContact] = useState("");
  const [pPhone, setPPhone] = useState("");
  const [pType, setPType] = useState<Promotor["type"]>("Otro");
  const [pNotes, setPNotes] = useState("");

  // Form states - Entrega
  const [ePromotorId, setEPromotorId] = useState("");
  const [eType, setEType] = useState<"recepcion" | "envio">("recepcion");
  const [eDescription, setEDescription] = useState("");
  const [eQuantity, setEQuantity] = useState("");
  const [eDate, setEDate] = useState("");
  const [eTime, setETime] = useState("");
  const [eAddress, setEAddress] = useState("");
  const [eNotes, setENotes] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredPromotores = useMemo(() =>
    promotores.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contact.toLowerCase().includes(searchTerm.toLowerCase())
    ), [promotores, searchTerm]);

  const todayEntregas = useMemo(() =>
    entregas.filter((e) => e.date === today)
      .sort((a, b) => a.time.localeCompare(b.time))
  , [entregas, today]);

  const upcomingEntregas = useMemo(() =>
    entregas.filter((e) => e.date > today && e.status !== "cancelado")
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  , [entregas, today]);

  const pendingCount = entregas.filter((e) => e.status === "pendiente").length;
  const todayCount = todayEntregas.length;

  const getPromotorName = (id: string) => promotores.find((p) => p.id === id)?.name || "Desconocido";
  const getPromotorBrand = (id: string) => promotores.find((p) => p.id === id)?.brand || "Otro";

  const openAddPromotor = (edit?: Promotor) => {
    if (edit) {
      setEditingPromotor(edit);
      setPName(edit.name);
      setPBrand(edit.brand);
      setPContact(edit.contact);
      setPPhone(edit.phone);
      setPType(edit.type);
      setPNotes(edit.notes);
    } else {
      setEditingPromotor(null);
      setPName(""); setPBrand(""); setPContact(""); setPPhone(""); setPType("Otro"); setPNotes("");
    }
    setShowAddPromotor(true);
  };

  const savePromotor = async () => {
    if (!pName || !pBrand) return;
    if (editingPromotor) {
      const updated: Promotor = { ...editingPromotor, name: pName, brand: pBrand, contact: pContact, phone: pPhone, type: pType, notes: pNotes };
      setPromotores((prev) => prev.map((p) => p.id === editingPromotor.id ? updated : p));
      await db.savePromotor(updated);
    } else {
      const newPromotor: Promotor = {
        id: `p${Date.now()}`, name: pName, brand: pBrand, contact: pContact, phone: pPhone, type: pType, notes: pNotes, active: true, dateAdded: new Date().toISOString(),
      };
      setPromotores((prev) => [...prev, newPromotor]);
      await db.savePromotor(newPromotor);
    }
    setShowAddPromotor(false);
  };

  const deletePromotor = async (id: string) => {
    setPromotores((prev) => prev.filter((p) => p.id !== id));
    await db.deletePromotor(id);
  };

  const toggleActive = async (id: string) => {
    setPromotores((prev) => {
      const updated = prev.map((p) => p.id === id ? { ...p, active: !p.active } : p);
      const promotor = updated.find((p) => p.id === id);
      if (promotor) db.savePromotor(promotor);
      return updated;
    });
  };

  const saveEntrega = async () => {
    if (!ePromotorId || !eDescription || !eDate || !eTime) return;
    const newEntrega: Entrega = {
      id: `e${Date.now()}`, promotorId: ePromotorId, type: eType, description: eDescription, quantity: eQuantity, date: eDate, time: eTime, status: "pendiente", address: eAddress || undefined, notes: eNotes || undefined,
    };
    setEntregas((prev) => [...prev, newEntrega]);
    setShowAddEntrega(false);
    setEPromotorId(""); setEDescription(""); setEQuantity(""); setEDate(""); setETime(""); setEAddress(""); setENotes("");
    await db.saveEntrega(newEntrega);
  };

  const updateEntregaStatus = async (id: string, status: Entrega["status"]) => {
    setEntregas((prev) => {
      const updated = prev.map((e) => e.id === id ? { ...e, status } : e);
      const entrega = updated.find((e) => e.id === id);
      if (entrega) db.saveEntrega(entrega);
      return updated;
    });
  };

  const deleteEntrega = async (id: string) => {
    setEntregas((prev) => prev.filter((e) => e.id !== id));
    await db.deleteEntrega(id);
  };

  return (
    <div className="p-8 h-full overflow-auto bg-background text-foreground font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Promotores y Entregas</h1>
            <p className="text-gray-500 text-xs mt-1">Registro de marcas promotoras y control de entregas.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Promotores Activos</span>
            </div>
            <p className="text-2xl text-foreground font-light">{promotores.filter((p) => p.active).length}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Entregas Hoy</span>
            </div>
            <p className="text-2xl text-foreground font-light">{todayCount}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pendientes</span>
            </div>
            <p className="text-2xl text-yellow-500 font-light">{pendingCount}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {([
            { key: "promotores" as const, label: "Promotores", icon: Tag },
            { key: "entregas" as const, label: "Entregas", icon: Truck },
            { key: "calendario" as const, label: "Calendario", icon: Calendar },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === tab.key ? "bg-primary/10 text-primary border border-primary/25" : "text-gray-500 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Promotores */}
        {activeTab === "promotores" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar promotor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-card border border-border rounded-lg py-2.5 pl-10 pr-3 text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={() => openAddPromotor()}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#b3922e] text-black rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Promotor
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPromotores.map((p) => (
                <div key={p.id} className={`bg-card border border-border rounded-xl p-5 shadow-sm ${!p.active ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${TYPE_COLORS[p.type]}`}>
                        {p.type}
                      </span>
                      {!p.active && (
                        <span className="text-[9px] px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 font-bold uppercase">Inactivo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(p.id)} className="p-1 text-gray-500 hover:text-yellow-500 cursor-pointer" title={p.active ? "Desactivar" : "Activar"}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openAddPromotor(p)} className="p-1 text-gray-500 hover:text-primary cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletePromotor(p.id)} className="p-1 text-gray-500 hover:text-red-500 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-sm text-foreground font-bold mb-1">{p.name}</h3>
                  <p className="text-[10px] text-primary font-semibold mb-2">{p.brand}</p>
                  <div className="space-y-1 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5"><User className="w-3 h-3" /> {p.contact}</div>
                    <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {p.phone}</div>
                    {p.notes && <p className="italic text-gray-400 mt-1">{p.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Entregas */}
        {activeTab === "entregas" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddEntrega(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#b3922e] text-black rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Nueva Entrega
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Hora</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Promotor</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Tipo</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Descripción</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Cantidad</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-semibold">Estado</th>
                    <th className="text-right py-3 px-4 text-gray-500 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {[...todayEntregas, ...upcomingEntregas].length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500 italic">No hay entregas registradas próximamente.</td>
                    </tr>
                  ) : (
                    [...todayEntregas, ...upcomingEntregas].map((e) => (
                      <tr key={e.id} className={`border-b border-border/50 ${e.date === today ? "bg-primary/5" : ""}`}>
                        <td className="py-3 px-4 font-mono text-foreground">
                          {e.date === today ? "Hoy" : e.date}
                        </td>
                        <td className="py-3 px-4 text-foreground">{e.time}</td>
                        <td className="py-3 px-4">
                          <span className="text-foreground font-semibold">{getPromotorName(e.promotorId)}</span>
                          <span className={`ml-1.5 text-[8px] px-1 py-0.5 rounded ${TYPE_COLORS[getPromotorBrand(e.promotorId)]}`}>
                            {getPromotorBrand(e.promotorId)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`flex items-center gap-1 text-[10px] font-semibold ${e.type === "recepcion" ? "text-green-500" : "text-blue-500"}`}>
                            {e.type === "recepcion" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {e.type === "recepcion" ? "Recepción" : "Envío"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-foreground">{e.description}</td>
                        <td className="py-3 px-4 text-gray-500">{e.quantity}</td>
                        <td className="py-3 px-4">
                          <select
                            value={e.status}
                            onChange={(ev) => updateEntregaStatus(e.id, ev.target.value as Entrega["status"])}
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border-0 cursor-pointer ${STATUS_STYLES[e.status]}`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en_camino">En Camino</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => deleteEntrega(e.id)} className="p-1 text-gray-500 hover:text-red-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Calendario */}
        {activeTab === "calendario" && (
          <div className="space-y-4">
            <h2 className="text-xs tracking-[0.18em] text-primary uppercase font-bold">Próximas Entregas</h2>
            {upcomingEntregas.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-8">No hay entregas programadas.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEntregas.map((e) => (
                  <div key={e.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-background border border-border flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">
                        {new Date(e.date + "T00:00:00").toLocaleDateString("es-MX", { month: "short" })}
                      </span>
                      <span className="text-lg text-foreground font-bold">
                        {new Date(e.date + "T00:00:00").getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-foreground text-xs font-bold">{e.description}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${STATUS_STYLES[e.status]}`}>
                          {STATUS_LABELS[e.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>{e.time}</span>
                        <span>{getPromotorName(e.promotorId)}</span>
                        <span>{e.quantity}</span>
                      </div>
                      {e.address && <p className="text-[10px] text-gray-400 mt-1">Dir: {e.address}</p>}
                      {e.notes && <p className="text-[10px] text-gray-400 italic mt-0.5">Nota: {e.notes}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {e.status === "pendiente" && (
                        <button onClick={() => updateEntregaStatus(e.id, "en_camino")} className="px-2 py-1 text-[9px] bg-blue-500/10 text-blue-500 rounded font-semibold hover:bg-blue-500/20 cursor-pointer">
                          Enviar
                        </button>
                      )}
                      {e.status === "en_camino" && (
                        <button onClick={() => updateEntregaStatus(e.id, "entregado")} className="px-2 py-1 text-[9px] bg-green-500/10 text-green-500 rounded font-semibold hover:bg-green-500/20 cursor-pointer">
                          Entregar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal: Add/Edit Promotor */}
      <Modal open={showAddPromotor} onClose={() => setShowAddPromotor(false)} title={editingPromotor ? "Editar Promotor" : "Nuevo Promotor"}>
        <ModalBody>
          <div className="space-y-3.5">
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Nombre de la Empresa</label>
              <input type="text" required placeholder="Ej. Distribuidora La Costeña" value={pName} onChange={(e) => setPName(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Marca / Rubro</label>
              <input type="text" required placeholder="Ej. Coca-Cola" value={pBrand} onChange={(e) => setPBrand(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Tipo</label>
                <select value={pType} onChange={(e) => setPType(e.target.value as Promotor["type"])} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                  {PROMOTOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Contacto</label>
                <input type="text" placeholder="Nombre del contacto" value={pContact} onChange={(e) => setPContact(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Teléfono</label>
              <input type="tel" placeholder="5551234567" value={pPhone} onChange={(e) => setPPhone(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Notas</label>
              <input type="text" placeholder="Ej. Entrega los lunes" value={pNotes} onChange={(e) => setPNotes(e.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <ModalFooter>
              <button type="button" onClick={() => setShowAddPromotor(false)} className="flex-1 py-2.5 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all">
                Cancelar
              </button>
              <button onClick={savePromotor} disabled={!pName || !pBrand} className="flex-1 py-2.5 bg-primary hover:bg-[#b3922e] text-black rounded-lg text-xs font-semibold tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {editingPromotor ? "Guardar" : "Crear"}
              </button>
            </ModalFooter>
          </div>
        </ModalBody>
      </Modal>

      {/* Modal: Add Entrega */}
      <Modal open={showAddEntrega} onClose={() => setShowAddEntrega(false)} title="Nueva Entrega">
        <ModalBody>
          <div className="space-y-3.5">
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Promotor</label>
              <select value={ePromotorId} onChange={(ev) => setEPromotorId(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                <option value="">Seleccionar promotor...</option>
                {promotores.filter((p) => p.active).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Tipo de Entrega</label>
              <div className="flex gap-2">
                <button onClick={() => setEType("recepcion")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${eType === "recepcion" ? "bg-green-500/10 text-green-500 border-green-500/25" : "border-border text-gray-500 hover:text-foreground"}`}>
                  <ArrowDownRight className="w-3.5 h-3.5 inline mr-1" /> Recepción
                </button>
                <button onClick={() => setEType("envio")} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${eType === "envio" ? "bg-blue-500/10 text-blue-500 border-blue-500/25" : "border-border text-gray-500 hover:text-foreground"}`}>
                  <ArrowUpRight className="w-3.5 h-3.5 inline mr-1" /> Envío
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Descripción</label>
              <input type="text" required placeholder="Ej. Refrescos Coca-Cola 600ml" value={eDescription} onChange={(ev) => setEDescription(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Cantidad</label>
                <input type="text" placeholder="Ej. 12 cajas" value={eQuantity} onChange={(ev) => setEQuantity(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Fecha</label>
                <input type="date" required value={eDate} onChange={(ev) => setEDate(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Hora</label>
              <input type="time" required value={eTime} onChange={(ev) => setETime(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            {eType === "envio" && (
              <div>
                <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Dirección de Entrega</label>
                <input type="text" placeholder="Dirección del cliente" value={eAddress} onChange={(ev) => setEAddress(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
              </div>
            )}
            <div>
              <label className="block text-[9px] tracking-widest text-gray-500 uppercase mb-1">Notas</label>
              <input type="text" placeholder="Observaciones..." value={eNotes} onChange={(ev) => setENotes(ev.target.value)} className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
            </div>
            <ModalFooter>
              <button type="button" onClick={() => setShowAddEntrega(false)} className="flex-1 py-2.5 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all">
                Cancelar
              </button>
              <button onClick={saveEntrega} disabled={!ePromotorId || !eDescription || !eDate || !eTime} className="flex-1 py-2.5 bg-primary hover:bg-[#b3922e] text-black rounded-lg text-xs font-semibold tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Registrar
              </button>
            </ModalFooter>
          </div>
        </ModalBody>
      </Modal>

    </div>
  );
}
