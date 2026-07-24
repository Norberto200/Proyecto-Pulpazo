import { useState, useMemo } from "react";
import {
  Plus, X, Bike, Car, Footprints, Phone, User, MapPin, Clock,
  Search, Edit2, Trash2, CheckCircle2, Package, ChevronRight,
  Pause, RotateCcw, AlertCircle, Truck,
} from "lucide-react";
import { useApp, Repartidor, EntregaRepartidor, Order } from "../context/AppContext";
import { Modal, ModalBody, ModalFooter } from "./ui/Modal";

const VEHICULO_OPTIONS = [
  { id: "bicicleta" as const, label: "Bicicleta", icon: Bike, color: "text-green-500" },
  { id: "moto" as const, label: "Moto", icon: Truck, color: "text-blue-500" },
  { id: "auto" as const, label: "Auto", icon: Car, color: "text-purple-500" },
  { id: "a_pie" as const, label: "A Pie", icon: Footprints, color: "text-amber-500" },
];

const ESTATUS_COLORS: Record<string, string> = {
  disponible: "bg-green-500/10 text-green-400 border border-green-500/20",
  en_entrega: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  descanso: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  inactivo: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const ESTATUS_LABELS: Record<string, string> = {
  disponible: "Disponible",
  en_entrega: "En Entrega",
  descanso: "Descanso",
  inactivo: "Inactivo",
};

const ENTREGA_ESTATUS_COLORS: Record<string, string> = {
  asignado: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  recogido: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  en_camino: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  entregado: "bg-green-500/10 text-green-400 border border-green-500/20",
  cancelado: "bg-red-500/10 text-red-400 border border-red-500/20",
};

const ENTREGA_ESTATUS_LABELS: Record<string, string> = {
  asignado: "Asignado",
  recogido: "Recogido",
  en_camino: "En Camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const ENTREGA_NEXT_STATUS: Record<string, EntregaRepartidor["estatus"]> = {
  asignado: "recogido",
  recogido: "en_camino",
  en_camino: "entregado",
};

export default function Repartidores() {
  const {
    repartidores, addRepartidor, updateRepartidor, deleteRepartidor,
    entregasRepartidor, addEntrega, updateEntregaStatus, cancelarEntrega,
    orders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"repartidores" | "entregas" | "historial">("repartidores");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddRepartidor, setShowAddRepartidor] = useState(false);
  const [editingRepartidor, setEditingRepartidor] = useState<Repartidor | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  // Form states
  const [rNombre, setRNombre] = useState("");
  const [rTelefono, setRTelefono] = useState("");
  const [rVehiculo, setRVehiculo] = useState<Repartidor["vehiculo"]>("moto");
  const [rNotas, setRNotas] = useState("");

  // Assign form
  const [selectedRepartidorId, setSelectedRepartidorId] = useState("");
  const [assignDireccion, setAssignDireccion] = useState("");
  const [assignNotas, setAssignNotas] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => ({
    disponibles: repartidores.filter(r => r.estatus === "disponible" && r.activo).length,
    enEntrega: repartidores.filter(r => r.estatus === "en_entrega").length,
    descanso: repartidores.filter(r => r.estatus === "descanso").length,
    inactivos: repartidores.filter(r => r.estatus === "inactivo").length,
    total: repartidores.filter(r => r.activo).length,
  }), [repartidores]);

  const pendingOrders = useMemo(() =>
    orders.filter(o =>
      o.status === "pendiente" &&
      (o.orderType === "domicilio" || o.orderType === "uber" || o.orderType === "rappi")
    ), [orders]);

  const activeEntregas = useMemo(() =>
    entregasRepartidor
      .filter(e => e.estatus !== "entregado" && e.estatus !== "cancelado")
      .sort((a, b) => b.hora.localeCompare(a.hora)),
    [entregasRepartidor]);

  const todayEntregas = useMemo(() =>
    entregasRepartidor
      .filter(e => e.fecha === today)
      .sort((a, b) => b.hora.localeCompare(a.hora)),
    [entregasRepartidor, today]);

  const filteredRepartidores = useMemo(() =>
    repartidores.filter(r =>
      r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.telefono.includes(searchTerm)
    ), [repartidores, searchTerm]);

  const getRepartidorName = (id: string) =>
    repartidores.find(r => r.id === id)?.nombre || "Sin asignar";

  const getOrderTotal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    return order?.total || 0;
  };

  const openAddRepartidor = (edit?: Repartidor) => {
    if (edit) {
      setEditingRepartidor(edit);
      setRNombre(edit.nombre);
      setRTelefono(edit.telefono);
      setRVehiculo(edit.vehiculo);
      setRNotas(edit.notas);
    } else {
      setEditingRepartidor(null);
      setRNombre(""); setRTelefono(""); setRVehiculo("moto"); setRNotas("");
    }
    setShowAddRepartidor(true);
  };

  const saveRepartidor = async () => {
    if (!rNombre) return;
    if (editingRepartidor) {
      await updateRepartidor({
        ...editingRepartidor,
        nombre: rNombre,
        telefono: rTelefono,
        vehiculo: rVehiculo,
        notas: rNotas,
      });
    } else {
      await addRepartidor({
        id: `rp${Date.now()}`,
        nombre: rNombre,
        telefono: rTelefono,
        vehiculo: rVehiculo,
        estatus: "disponible",
        activo: true,
        notas: rNotas,
        fechaRegistro: new Date().toISOString(),
      });
    }
    setShowAddRepartidor(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este repartidor?")) return;
    await deleteRepartidor(id);
  };

  const toggleActive = async (rp: Repartidor) => {
    await updateRepartidor({
      ...rp,
      activo: !rp.activo,
      estatus: rp.activo ? "inactivo" : "disponible",
    });
  };

  const changeEstatus = async (rp: Repartidor, estatus: Repartidor["estatus"]) => {
    await updateRepartidor({ ...rp, estatus });
  };

  const openAssign = (order: Order) => {
    setAssigningOrder(order);
    setSelectedRepartidorId("");
    setAssignDireccion(order.clientAddress || "");
    setAssignNotas("");
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assigningOrder || !selectedRepartidorId) return;
    const now = new Date();
    await addEntrega({
      id: `er${Date.now()}`,
      repartidorId: selectedRepartidorId,
      orderId: assigningOrder.id,
      estatus: "asignado",
      fecha: now.toISOString().split("T")[0],
      hora: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      direccion: assignDireccion,
      notas: assignNotas,
    });
    await changeEstatus(
      repartidores.find(r => r.id === selectedRepartidorId)!,
      "en_entrega"
    );
    setShowAssignModal(false);
  };

  const advanceEntregaStatus = async (entrega: EntregaRepartidor) => {
    const next = ENTREGA_NEXT_STATUS[entrega.estatus];
    if (!next) return;
    await updateEntregaStatus(entrega.id, next);
    if (next === "entregado") {
      const otherActive = entregasRepartidor.filter(
        e => e.id !== entrega.id && e.repartidorId === entrega.repartidorId && e.estatus !== "entregado" && e.estatus !== "cancelado"
      );
      if (otherActive.length === 0) {
        const rp = repartidores.find(r => r.id === entrega.repartidorId);
        if (rp) await changeEstatus(rp, "disponible");
      }
    }
  };

  const VehiculoIcon = (vehiculo: string) => {
    const found = VEHICULO_OPTIONS.find(v => v.id === vehiculo);
    if (!found) return <Truck className="w-4 h-4" />;
    const Icon = found.icon;
    return <Icon className={`w-4 h-4 ${found.color}`} />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Repartidores</h1>
          <p className="text-gray-400 text-sm">Gestiona tu equipo de domicilios</p>
        </div>
        <button
          onClick={() => openAddRepartidor()}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Repartidor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Disponibles", value: stats.disponibles, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
          { label: "En Entrega", value: stats.enEntrega, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Descanso", value: stats.descanso, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
          { label: "Inactivos", value: stats.inactivos, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
        {[
          { id: "repartidores" as const, label: "Repartidores", count: filteredRepartidores.length },
          { id: "entregas" as const, label: "Entregas Activas", count: activeEntregas.length },
          { id: "historial" as const, label: "Historial Hoy", count: todayEntregas.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-amber-500/20 text-amber-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Pending Delivery Orders Banner */}
      {pendingOrders.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Pedidos de Domicilio Pendientes ({pendingOrders.length})</span>
          </div>
          <div className="space-y-2">
            {pendingOrders.map(order => {
              const alreadyAssigned = entregasRepartidor.some(
                e => e.orderId === order.id && e.estatus !== "cancelado"
              );
              return (
                <div key={order.id} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                  <div>
                    <span className="text-white font-medium">{order.clientName || "Sin nombre"}</span>
                    <span className="text-gray-400 text-sm ml-2">{order.clientPhone}</span>
                    <span className="text-amber-400 text-sm ml-2">${order.total.toFixed(2)}</span>
                    {alreadyAssigned && (
                      <span className="text-green-400 text-xs ml-2 bg-green-500/10 px-2 py-0.5 rounded-full">Asignado</span>
                    )}
                  </div>
                  {!alreadyAssigned && (
                    <button
                      onClick={() => openAssign(order)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" /> Asignar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "repartidores" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRepartidores.map(rp => (
              <div key={rp.id} className={`bg-gray-900 border border-gray-800 rounded-xl p-4 ${!rp.activo ? "opacity-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{rp.nombre}</div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        {VehiculoIcon(rp.vehiculo)}
                        <span>{VEHICULO_OPTIONS.find(v => v.id === rp.vehiculo)?.label || rp.vehiculo}</span>
                        {rp.telefono && (
                          <>
                            <span>·</span>
                            <Phone className="w-3 h-3" />
                            <span>{rp.telefono}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTATUS_COLORS[rp.estatus]}`}>
                    {ESTATUS_LABELS[rp.estatus]}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                  {rp.activo && (
                    <div className="flex gap-1 flex-1">
                      {(["disponible", "descanso"] as const).map(est => (
                        <button
                          key={est}
                          onClick={() => changeEstatus(rp, est)}
                          className={`px-2 py-1 rounded text-xs transition-colors ${
                            rp.estatus === est
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-gray-800 text-gray-400 hover:text-gray-300"
                          }`}
                        >
                          {ESTATUS_LABELS[est]}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => openAddRepartidor(rp)} className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(rp)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors">
                      {rp.activo ? <Pause className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => handleDelete(rp.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredRepartidores.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay repartidores registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "entregas" && (
        <div className="space-y-3">
          {activeEntregas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay entregas activas</p>
            </div>
          ) : (
            activeEntregas.map(er => (
              <div key={er.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{getRepartidorName(er.repartidorId)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ENTREGA_ESTATUS_COLORS[er.estatus]}`}>
                        {ENTREGA_ESTATUS_LABELS[er.estatus]}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      Pedido #{er.orderId.slice(-6)} · ${getOrderTotal(er.orderId).toFixed(2)}
                    </div>
                    {er.direccion && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                        <MapPin className="w-3 h-3" /> {er.direccion}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" /> {er.hora}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                  {ENTREGA_NEXT_STATUS[er.estatus] && (
                    <button
                      onClick={() => advanceEntregaStatus(er)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      {ENTREGA_ESTATUS_LABELS[ENTREGA_NEXT_STATUS[er.estatus]]}
                    </button>
                  )}
                  <button
                    onClick={() => cancelarEntrega(er.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "historial" && (
        <div className="space-y-3">
          {todayEntregas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay entregas hoy</p>
            </div>
          ) : (
            todayEntregas.map(er => (
              <div key={er.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      er.estatus === "entregado" ? "bg-green-400" :
                      er.estatus === "cancelado" ? "bg-red-400" : "bg-amber-400"
                    }`} />
                    <div>
                      <span className="text-white font-medium">{getRepartidorName(er.repartidorId)}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${ENTREGA_ESTATUS_COLORS[er.estatus]}`}>
                        {ENTREGA_ESTATUS_LABELS[er.estatus]}
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">{er.hora}</div>
                </div>
                <div className="text-gray-500 text-xs mt-2 ml-5">
                  Pedido #{er.orderId.slice(-6)} · ${getOrderTotal(er.orderId).toFixed(2)}
                  {er.direccion && <span> · {er.direccion}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add/Edit Repartidor Modal */}
      <Modal open={showAddRepartidor} onClose={() => setShowAddRepartidor(false)}>
        <ModalBody>
          <h3 className="text-lg font-bold text-white mb-4">
            {editingRepartidor ? "Editar Repartidor" : "Nuevo Repartidor"}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre *</label>
              <input
                type="text" value={rNombre} onChange={e => setRNombre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                placeholder="Nombre del repartidor"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Teléfono</label>
              <input
                type="tel" value={rTelefono} onChange={e => setRTelefono(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                placeholder="10 dígitos"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Vehículo</label>
              <div className="grid grid-cols-4 gap-2">
                {VEHICULO_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setRVehiculo(opt.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                        rVehiculo === opt.id
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notas</label>
              <textarea
                value={rNotas} onChange={e => setRNotas(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                rows={2} placeholder="Notas internas..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowAddRepartidor(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={saveRepartidor}
            disabled={!rNombre}
            className="px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {editingRepartidor ? "Guardar" : "Crear"}
          </button>
        </ModalFooter>
      </Modal>

      {/* Assign Delivery Modal */}
      <Modal open={showAssignModal} onClose={() => setShowAssignModal(false)}>
        <ModalBody>
          <h3 className="text-lg font-bold text-white mb-4">Asignar Repartidor</h3>
          {assigningOrder && (
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <div className="text-white font-medium">{assigningOrder.clientName || "Sin nombre"}</div>
              <div className="text-gray-400 text-sm">{assigningOrder.clientPhone} · ${assigningOrder.total.toFixed(2)}</div>
              {assigningOrder.clientAddress && (
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <MapPin className="w-3 h-3" /> {assigningOrder.clientAddress}
                </div>
              )}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Repartidor *</label>
              <div className="space-y-2">
                {repartidores.filter(r => r.estatus === "disponible" && r.activo).map(rp => (
                  <button
                    key={rp.id}
                    onClick={() => setSelectedRepartidorId(rp.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedRepartidorId === rp.id
                        ? "bg-amber-500/20 border-amber-500/30"
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-white text-sm font-medium">{rp.nombre}</div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          {VehiculoIcon(rp.vehiculo)}
                          <span>{rp.telefono}</span>
                        </div>
                      </div>
                    </div>
                    {selectedRepartidorId === rp.id && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    )}
                  </button>
                ))}
                {repartidores.filter(r => r.estatus === "disponible" && r.activo).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay repartidores disponibles</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Dirección de entrega</label>
              <input
                type="text" value={assignDireccion} onChange={e => setAssignDireccion(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                placeholder="Dirección completa"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Notas</label>
              <input
                type="text" value={assignNotas} onChange={e => setAssignNotas(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
                placeholder="Instrucciones especiales..."
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedRepartidorId}
            className="px-4 py-2 bg-green-500 text-black rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Asignar Entrega
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
