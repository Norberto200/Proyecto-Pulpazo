import { useState } from "react";
import { Plus, Edit2, Trash2, LayoutGrid, UtensilsCrossed, CreditCard, Star, Banknote, ChevronDown, ChevronUp, Search } from "lucide-react";
import NuevoPlatilloModal from "./NuevoPlatilloModal";
import { useApp, Dish } from "../context/AppContext";

interface PaymentMethod {
  id: string; name: string; description: string; icon: React.ElementType; active: boolean;
}

const initialPayments: PaymentMethod[] = [
  { id: "p1", name: "Efectivo", description: "Moneda nacional o extranjera", icon: Banknote, active: true },
  { id: "p2", name: "Tarjeta de Crédito/Débito", description: "Visa, Mastercard, Amex, Carnet", icon: CreditCard, active: true },
];

const statusColor: Record<string, string> = { libre: "#22c55e", ocupado: "#ef4444", reservado: "#f97316" };

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl overflow-hidden mb-6">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#D4AF37]/5 transition-colors">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
          <span className="text-sm tracking-[0.15em] text-[#D4AF37] uppercase">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> : <ChevronDown className="w-4 h-4 text-gray-500" strokeWidth={1.5} />}
      </button>
      {open && <div className="border-t border-[#D4AF37]/10">{children}</div>}
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
    tables
  } = useApp();

  const [payments, setPayments] = useState<PaymentMethod[]>(initialPayments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [dishSearchQuery, setDishSearchQuery] = useState("");

  const handleSaveDish = (savedDish: Omit<Dish, "id" | "recommended">) => {
    if (editingDish) {
      updateDish(editingDish.id, savedDish);
      setEditingDish(null);
    } else {
      addDish(savedDish);
    }
    setIsModalOpen(false);
  };

  const togglePayment = (id: string) =>
    setPayments(payments.map((p) => p.id === id ? { ...p, active: !p.active } : p));

  const libre = tables.filter((t) => t.status === "libre").length;
  const ocupado = tables.filter((t) => t.status === "ocupado").length;
  const reservado = tables.filter((t) => t.status === "reservado").length;

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(dishSearchQuery.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl text-[#D4AF37] tracking-wide">Panel de Administración</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona el restaurante desde un solo lugar</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Platillos activos", value: dishes.filter((d) => d.available).length, sub: `${dishes.length} total` },
            { label: "Mesas libres", value: libre, sub: `${ocupado} ocupadas · ${reservado} reservadas` },
            { label: "Métodos de pago", value: payments.filter((p) => p.active).length, sub: `${payments.length} configurados` },
          ].map((s) => (
            <div key={s.label} className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5">
              <p className="text-3xl text-[#D4AF37] font-light">{s.value}</p>
              <p className="text-sm text-white mt-1">{s.label}</p>
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar platillo..."
                  value={dishSearchQuery}
                  onChange={(e) => setDishSearchQuery(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder:text-gray-600 text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div className="flex justify-end">
                <button onClick={() => { setEditingDish(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Nuevo Platillo
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {filteredDishes.map((dish) => (
                <div key={dish.id} className="flex items-center gap-4 bg-[#0d0d0d] rounded-lg px-4 py-3 border border-[#D4AF37]/10">
                  <img src={dish.image} alt={dish.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm truncate">{dish.name}</p>
                      {dish.recommended && <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37] flex-shrink-0" />}
                    </div>
                    <p className="text-gray-500 text-xs">{dish.category} · ${dish.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Disponible toggle */}
                    <button onClick={() => toggleAvailable(dish.id)}
                      className={`w-8 h-4 rounded-full relative transition-colors ${dish.available ? "bg-[#22c55e]" : "bg-[#333]"}`}>
                      <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${dish.available ? "left-4" : "left-0.5"}`} />
                    </button>
                    {/* Star */}
                    <button onClick={() => toggleRecommended(dish.id)} title="Recomendado"
                      className={`transition-colors ${dish.recommended ? "text-[#D4AF37]" : "text-gray-600 hover:text-[#D4AF37]"}`}>
                      <Star className="w-4 h-4" fill={dish.recommended ? "#D4AF37" : "none"} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => { setEditingDish(dish); setIsModalOpen(true); }} className="text-gray-500 hover:text-[#D4AF37] transition-colors">
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => removeDish(dish.id)} className="text-gray-600 hover:text-[#ef4444] transition-colors">
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
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
                  <div key={pm.id} className={`flex items-center gap-4 rounded-xl p-4 border transition-all ${pm.active ? "border-[#D4AF37]/30 bg-[#0d0d0d]" : "border-[#D4AF37]/10 bg-[#0d0d0d] opacity-50"}`}>
                    <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{pm.name}</p>
                      <p className="text-xs text-gray-500 truncate">{pm.description}</p>
                    </div>
                    <button onClick={() => togglePayment(pm.id)}
                      className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${pm.active ? "bg-[#D4AF37]" : "bg-[#333]"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${pm.active ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
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
