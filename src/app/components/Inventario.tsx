import { useState } from "react";
import { Plus, Minus, Search, RotateCcw, AlertTriangle, Boxes, Trash2, Edit2, X } from "lucide-react";
import { useApp, Insumo } from "../context/AppContext";

export default function Inventario() {
  const { insumos, addInsumo, updateInsumo, removeInsumo } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unit, setUnit] = useState("kg");

  const filteredInsumos = insumos.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;

  const handleOpenAddModal = () => {
    setEditingInsumo(null);
    setName("");
    setStockActual("");
    setStockMinimo("");
    setUnit("kg");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (insumo: Insumo) => {
    setEditingInsumo(insumo);
    setName(insumo.name);
    setStockActual(String(insumo.stockActual));
    setStockMinimo(String(insumo.stockMinimo));
    setUnit(insumo.unit);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stockActual || !stockMinimo) return;

    const actualVal = parseFloat(stockActual);
    const minimoVal = parseFloat(stockMinimo);

    if (isNaN(actualVal) || isNaN(minimoVal)) return;

    if (editingInsumo) {
      updateInsumo(editingInsumo.id, {
        name,
        stockActual: actualVal,
        stockMinimo: minimoVal,
        unit,
      });
    } else {
      addInsumo({
        name,
        stockActual: actualVal,
        stockMinimo: minimoVal,
        unit,
      });
    }
    setIsModalOpen(false);
  };

  const adjustStock = (insumo: Insumo, delta: number) => {
    const newVal = Math.max(0, parseFloat((insumo.stockActual + delta).toFixed(2)));
    updateInsumo(insumo.id, { stockActual: newVal });
  };

  const getStatus = (insumo: Insumo) => {
    if (insumo.stockActual === 0) return { label: "Agotado", color: "bg-red-500/10 text-red-500 border border-red-500/20" };
    if (insumo.stockActual <= insumo.stockMinimo) return { label: "Bajo Stock", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" };
    return { label: "Saludable", color: "bg-green-500/10 text-green-500 border border-green-500/20" };
  };

  return (
    <div className="p-8 h-full overflow-auto font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl text-[#D4AF37] tracking-wide">Control de Inventario</h1>
            <p className="text-gray-500 text-sm mt-1">Monitorea y gestiona tus insumos críticos en tiempo real.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wide transition-colors self-start sm:self-center"
          >
            <Plus className="w-4 h-4" /> Nuevo Insumo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-3xl text-[#D4AF37] font-light">{insumos.length}</p>
              <p className="text-sm text-white mt-1">Total Insumos</p>
              <p className="text-xs text-gray-500 mt-0.5">Categorías activas</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
              <Boxes className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className={`text-3xl font-light ${lowStockCount > 0 ? "text-red-500" : "text-[#D4AF37]"}`}>{lowStockCount}</p>
              <p className="text-sm text-white mt-1">Stock Bajo</p>
              <p className="text-xs text-gray-500 mt-0.5">Requieren reabastecimiento</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              lowStockCount > 0
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]"
            }`}>
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl overflow-hidden">
          {/* Controls */}
          <div className="p-5 border-b border-[#D4AF37]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <h2 className="text-base text-[#D4AF37] tracking-wider uppercase font-semibold">Lista de Insumos</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Buscar insumo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2 pl-9 pr-4 text-white placeholder:text-gray-600 text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="w-8 h-8 rounded-lg bg-[#0d0d0d] border border-[#D4AF37]/20 flex items-center justify-center text-gray-400 hover:text-[#D4AF37] transition-colors"
                title="Limpiar búsqueda"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D4AF37]/10 text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Insumo</th>
                  <th className="px-6 py-4 font-semibold">Stock Actual</th>
                  <th className="px-6 py-4 font-semibold">Mínimo</th>
                  <th className="px-6 py-4 font-semibold text-center">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredInsumos.map((insumo) => {
                  const status = getStatus(insumo);
                  // Calculate progress bar percentage (capped at 100)
                  const percent = Math.min(100, Math.round((insumo.stockActual / (insumo.stockMinimo * 2.5)) * 100)) || 0;
                  const barColor = insumo.stockActual === 0 ? "bg-red-500" : insumo.stockActual <= insumo.stockMinimo ? "bg-yellow-500" : "bg-[#D4AF37]";

                  return (
                    <tr key={insumo.id} className="hover:bg-[#D4AF37]/2 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-medium">{insumo.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-40">
                          <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-white text-sm font-semibold">{insumo.stockActual}</span>
                            <span className="text-gray-500 text-xs">{insumo.unit}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">{insumo.stockMinimo} {insumo.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => adjustStock(insumo, insumo.unit === "L" || insumo.unit === "kg" ? 0.5 : 1)}
                            className="w-7 h-7 rounded bg-[#0d0d0d] border border-[#D4AF37]/30 text-green-500 hover:bg-green-500/10 flex items-center justify-center transition-colors"
                            title="Aumentar Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => adjustStock(insumo, insumo.unit === "L" || insumo.unit === "kg" ? -0.5 : -1)}
                            className="w-7 h-7 rounded bg-[#0d0d0d] border border-[#D4AF37]/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                            title="Reducir Stock"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(insumo)}
                            className="w-7 h-7 rounded bg-[#0d0d0d] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 flex items-center justify-center transition-colors"
                            title="Editar Insumo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeInsumo(insumo.id)}
                            className="w-7 h-7 rounded bg-[#0d0d0d] border border-[#D4AF37]/30 text-gray-500 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                            title="Eliminar Insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredInsumos.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-xs">
                No se encontraron insumos que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-[#D4AF37]/30 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/15">
              <h3 className="text-sm tracking-widest text-[#D4AF37] uppercase font-semibold">
                {editingInsumo ? "Editar Insumo" : "Nuevo Insumo"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pulpo Fresco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 px-3 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Stock Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 15"
                    value={stockActual}
                    onChange={(e) => setStockActual(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 px-3 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Mínimo Crítico</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 5"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 px-3 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Unidad de Medida</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#D4AF37]/25 rounded-lg py-2.5 px-3 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                >
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="g">Gramos (g)</option>
                  <option value="L">Litros (L)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unidades">Unidades</option>
                  <option value="paquetes">Paquetes</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-600 text-gray-400 hover:text-white rounded-lg text-xs font-semibold tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wider transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
