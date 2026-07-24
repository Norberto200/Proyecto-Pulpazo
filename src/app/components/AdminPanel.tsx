import { useState } from "react";
import { Plus, Edit2, Trash2, LayoutGrid, UtensilsCrossed, CreditCard, Star, Banknote, ChevronDown, ChevronUp, Search, Database, Cloud, RefreshCw, Upload, Download, ShieldAlert } from "lucide-react";
import NuevoPlatilloModal from "./NuevoPlatilloModal";
import { useApp, Dish } from "../context/AppContext";
import { db } from "../../lib/supabase-service";

interface PaymentMethod {
  id: string; name: string; description: string; icon: React.ElementType; active: boolean;
}

const initialPayments: PaymentMethod[] = [
  { id: "p1", name: "Efectivo", description: "Moneda nacional o extranjera", icon: Banknote, active: true },
  { id: "p2", name: "Tarjeta de Crédito/Débito", description: "Visa, Mastercard, Amex, Carnet", icon: CreditCard, active: true },
];

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-6 shadow-sm">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm tracking-[0.15em] text-primary uppercase font-semibold">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={1.5} />}
      </button>
      {open && <div className="border-t border-border">{children}</div>}
    </div>
  );
}

export default function AdminPanel() {
  const {
    dishes,
    addDish,
    updateDish,
    removeDish,
    toggleAvailable,
    toggleRecommended,
    tables,
    orders,
    insumos,
    setDishes,
    setTables,
    setInsumos,
    userRole,
    clientes,
    gastos,
    abonos,
    promotores,
    entregas,
    recetas,
    descuentos,
    setDescuentos,
    notificaciones,
  } = useApp();

  const [payments, setPayments] = useState<PaymentMethod[]>(initialPayments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishSearchQuery, setDishSearchQuery] = useState("");

  // Cloud backup states
  const [cloudBackupActive, setCloudBackupActive] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState("Hoy, 15:30 h");

  // Role Restriction check
  if (userRole === "mesero" || userRole === "cocina") {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-center gap-4 bg-background text-foreground transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Acceso Restringido</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          Tu rol actual es <span className="text-primary font-semibold capitalize">{userRole}</span>. Solo los Administradores y Cajeras tienen permisos para acceder a las configuraciones de administración.
        </p>
      </div>
    );
  }

  const handleSaveDish = (savedDish: Omit<Dish, "id" | "recommended">) => {
    if (editingDish) {
      updateDish(editingDish.id, savedDish);
      setEditingDish(null);
    } else {
      addDish(savedDish);
    }
    setIsModalOpen(false);
  };

  const togglePayment = (id: string) => {
    if (userRole !== "administrador") {
      alert("Solo el Administrador puede activar/desactivar métodos de pago.");
      return;
    }
    setPayments(payments.map((p) => p.id === id ? { ...p, active: !p.active } : p));
  };

  const libre = tables.filter((t) => t.status === "libre").length;
  const ocupado = tables.filter((t) => t.status === "ocupado").length;
  const reservado = tables.filter((t) => t.status === "reservado").length;

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(dishSearchQuery.toLowerCase())
  );

  // Backup Export
  const handleExportBackup = () => {
    const dataObj = { dishes, tables, orders, insumos, clientes, gastos, abonos, promotores, entregas, recetas, descuentos };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `el_pulpazo_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Backup Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.dishes) setDishes(data.dishes);
        if (data.tables) setTables(data.tables);
        if (data.insumos) setInsumos(data.insumos);
        if (data.descuentos) setDescuentos(data.descuentos);
        alert("¡Base de datos y catálogo importados con éxito!");
      } catch (err) {
        alert("Error al leer el archivo. Asegúrate de que es un respaldo JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  // Cloud Backup Simulation - Push
  const handleSimulateCloudBackup = async () => {
    setSyncing(true);
    try {
      await Promise.all([
        db.saveDishes(dishes),
        db.saveTables(tables),
        db.saveOrders(orders),
        db.saveInsumos(insumos),
        db.saveClientes(clientes),
        db.saveGastos(gastos),
        db.saveAbonos(abonos),
        db.saveRecetas(recetas),
        db.saveDescuentos(descuentos),
      ]);
      const timeNow = new Date().toLocaleTimeString("es-MX", { hour: '2-digit', minute: '2-digit' }) + " h";
      setLastBackupTime(`Hoy, ${timeNow}`);
      alert("¡Sincronización exitosa en la nube de El Pulpazo!");
    } catch (err) {
      alert("Error al sincronizar. Verifica tu conexión a internet.");
    } finally {
      setSyncing(false);
    }
  };

  // Cloud Backup Simulation - Pull
  const [pulling, setPulling] = useState(false);
  const handlePullFromCloud = async () => {
    setPulling(true);
    try {
      const [fetchedDishes, fetchedTables, fetchedOrders, fetchedInsumos, fetchedClientes, fetchedGastos, fetchedAbonos] = await Promise.all([
        db.fetchDishes(),
        db.fetchTables(),
        db.fetchOrders(),
        db.fetchInsumos(),
        db.fetchClientes(),
        db.fetchGastos(),
        db.fetchAbonos(),
      ]);
      if (fetchedDishes.length > 0) setDishes(fetchedDishes);
      if (fetchedTables.length > 0) setTables(fetchedTables);
      if (fetchedInsumos.length > 0) setInsumos(fetchedInsumos);
      alert("¡Datos descargados de la nube con éxito!");
    } catch (err) {
      alert("Error al descargar. Verifica tu conexión.");
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-auto bg-background text-foreground transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-primary tracking-wide font-medium">Panel de Administración</h1>
            <p className="text-gray-500 text-xs mt-1">Gestiona el menú de mariscos, pagos y seguridad del sistema</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Platillos activos", value: dishes.filter((d) => d.available).length, sub: `${dishes.length} en catálogo` },
            { label: "Mesas libres", value: libre, sub: `${ocupado} ocupadas · ${reservado} reservadas` },
            { label: "Métodos de pago", value: payments.filter((p) => p.active).length, sub: `${payments.length} autorizados` },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <p className="text-3xl text-primary font-light">{s.value}</p>
              <p className="text-sm text-foreground mt-1 font-semibold">{s.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Gestión de Platillos ── */}
        <Section title="Gestión de Platillos" icon={UtensilsCrossed}>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
              {/* Search input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar platillo..."
                  value={dishSearchQuery}
                  onChange={(e) => setDishSearchQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 pl-9 pr-4 text-foreground placeholder:text-gray-500 text-xs focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={() => { setEditingDish(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer shadow-sm">
                  <Plus className="w-4 h-4" /> Nuevo Platillo
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="flex items-center gap-4 bg-background rounded-lg px-4 py-3 border border-border shadow-xs">
                  <img src={dish.image} alt={dish.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-sm font-semibold truncate">{dish.name}</p>
                      {dish.recommended && <Star className="w-3 h-3 text-primary fill-primary flex-shrink-0" />}
                    </div>
                    <p className="text-gray-500 text-xs">{dish.category} · ${dish.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Disponible toggle */}
                    <button onClick={() => toggleAvailable(dish.id)}
                      className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${dish.available ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${dish.available ? "left-4" : "left-0.5"}`} />
                    </button>
                    {/* Star */}
                    <button onClick={() => toggleRecommended(dish.id)} title="Recomendado"
                      className={`transition-colors cursor-pointer ${dish.recommended ? "text-primary" : "text-gray-400 hover:text-primary"}`}>
                      <Star className="w-4 h-4" fill={dish.recommended ? "var(--primary)" : "none"} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => { setEditingDish(dish); setIsModalOpen(true); }} className="text-gray-400 hover:text-primary transition-colors cursor-pointer">
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    {/* Delete only allowed for admin role */}
                    {userRole === "administrador" ? (
                      <button onClick={() => removeDish(dish.id)} className="text-gray-400 hover:text-[#ef4444] transition-colors cursor-pointer">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <button disabled className="text-gray-300 cursor-not-allowed opacity-50" title="Requiere rol de Administrador">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Formas de Pago ── */}
        <Section title="Formas de Pago" icon={CreditCard}>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {payments.map((pm) => {
                const Icon = pm.icon;
                return (
                  <div key={pm.id} className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${pm.active ? "border-primary/30 bg-background shadow-xs" : "border-border bg-background opacity-50"}`}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-semibold">{pm.name}</p>
                      <p className="text-xs text-gray-500 truncate">{pm.description}</p>
                    </div>
                    <button onClick={() => togglePayment(pm.id)}
                      className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors cursor-pointer ${pm.active ? "bg-primary" : "bg-gray-300 dark:bg-gray-700"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pm.active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── Respaldo y Seguridad en la Nube ── */}
        <Section title="Respaldo y Seguridad en la Nube" icon={Database}>
          <div className="p-5 space-y-6">
            
            {/* Cloud backup control */}
            <div className="bg-background border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
              <div className="space-y-1">
                <p className="text-sm text-foreground font-semibold flex items-center gap-1.5">
                  <Cloud className="w-4.5 h-4.5 text-primary" /> Copias de Seguridad en la Nube
                </p>
                <p className="text-xs text-gray-500">Resguarda automáticamente tus clientes, productos y finanzas de forma segura.</p>
                <p className="text-[10px] text-gray-500">Último respaldo en la nube: <span className="text-green-500 font-semibold">{lastBackupTime}</span></p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleSimulateCloudBackup}
                  disabled={syncing}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-[#F4D03F] disabled:from-gray-300 disabled:to-gray-400 text-black rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Sincronizando..." : "Respaldar en la Nube"}
                </button>

                <button
                  onClick={handlePullFromCloud}
                  disabled={pulling}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-primary text-primary hover:bg-primary/10 disabled:opacity-40 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer"
                >
                  <Download className={`w-3.5 h-3.5 ${pulling ? "animate-spin" : ""}`} />
                  {pulling ? "Descargando..." : "Descargar de la Nube"}
                </button>

                <button
                  onClick={() => setCloudBackupActive(!cloudBackupActive)}
                  className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors cursor-pointer ${cloudBackupActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${cloudBackupActive ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            {/* Local backup control (JSON Export / Import) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-background border border-border rounded-xl p-4 space-y-3 shadow-xs">
                <p className="text-xs text-foreground font-bold flex items-center gap-1">
                  <Download className="w-4 h-4 text-primary" /> Exportar Base de Datos Local
                </p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Descarga un archivo `.json` que contiene todos los productos, mesas, clientes y gastos actuales para guardarlo en una memoria física.
                </p>
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wider transition-colors cursor-pointer shadow-xs w-full flex items-center justify-center gap-1"
                >
                  Descargar Respaldo (.JSON)
                </button>
              </div>

              <div className="bg-background border border-border rounded-xl p-4 space-y-3 shadow-xs">
                <p className="text-xs text-foreground font-bold flex items-center gap-1">
                  <Upload className="w-4 h-4 text-primary" /> Importar Respaldo
                </p>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Selecciona y sube un archivo `.json` de respaldo previamente exportado para restaurar el catálogo e insumos del restaurante de forma instantánea.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="px-4 py-2 border border-border text-foreground hover:bg-background rounded-lg text-xs font-semibold tracking-wider transition-colors w-full flex items-center justify-center gap-1">
                    Cargar Respaldo (.JSON)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </Section>
      </div>

      {isModalOpen && (
        <NuevoPlatilloModal
          onClose={() => { setIsModalOpen(false); setEditingDish(null); }}
          onSave={handleSaveDish}
          dishToEdit={editingDish || undefined}
        />
      )}
    </div>
  );
}
