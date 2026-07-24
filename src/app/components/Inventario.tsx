import { useState, useMemo } from "react";
import { Plus, Minus, Search, RotateCcw, AlertTriangle, Boxes, Trash2, Edit2, X, Eye, Link, ChefHat, Unlink } from "lucide-react";
import { useApp, Insumo, DishIngredient } from "../context/AppContext";

export default function Inventario() {
  const {
    insumos, addInsumo, updateInsumo, removeInsumo,
    dishes, recetas, addReceta, deleteReceta, getRecetasByDish, userRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"insumos" | "recetas">("insumos");
  const [searchQuery, setSearchQuery] = useState("");

  const isReadOnly = userRole === "mesero" || userRole === "cocina";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  // Recipe modal states
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState("");
  const [recipeInsumoId, setRecipeInsumoId] = useState("");
  const [recipeCantidad, setRecipeCantidad] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");
  const [unit, setUnit] = useState("kg");

  const filteredInsumos = insumos.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;

  const dishesWithRecipes = useMemo(() =>
    dishes.filter(d => recetas.some(r => r.dishId === d.id))
  , [dishes, recetas]);

  const dishesWithoutRecipes = useMemo(() =>
    dishes.filter(d => !recetas.some(r => r.dishId === d.id))
  , [dishes, recetas]);

  const handleOpenAddModal = () => {
    if (isReadOnly) return;
    setEditingInsumo(null);
    setName(""); setStockActual(""); setStockMinimo(""); setUnit("kg");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (insumo: Insumo) => {
    if (isReadOnly) return;
    setEditingInsumo(insumo);
    setName(insumo.name); setStockActual(String(insumo.stockActual));
    setStockMinimo(String(insumo.stockMinimo)); setUnit(insumo.unit);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !stockActual || !stockMinimo) return;
    const actualVal = parseFloat(stockActual);
    const minimoVal = parseFloat(stockMinimo);
    if (isNaN(actualVal) || isNaN(minimoVal)) return;

    if (editingInsumo) {
      updateInsumo(editingInsumo.id, { name, stockActual: actualVal, stockMinimo: minimoVal, unit });
    } else {
      addInsumo({ name, stockActual: actualVal, stockMinimo: minimoVal, unit });
    }
    setIsModalOpen(false);
  };

  const adjustStock = (insumo: Insumo, delta: number) => {
    if (isReadOnly) return;
    const newVal = Math.max(0, parseFloat((insumo.stockActual + delta).toFixed(2)));
    updateInsumo(insumo.id, { stockActual: newVal });
  };

  const getStatus = (insumo: Insumo) => {
    if (insumo.stockActual === 0) return { label: "Agotado", color: "bg-red-500/10 text-red-500 border border-red-500/20" };
    if (insumo.stockActual <= insumo.stockMinimo) return { label: "Bajo Stock", color: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" };
    return { label: "Saludable", color: "bg-green-500/10 text-green-500 border border-green-500/20" };
  };

  const openAddRecipe = (dishId?: string) => {
    setSelectedDishId(dishId || "");
    setRecipeInsumoId("");
    setRecipeCantidad("");
    setShowRecipeModal(true);
  };

  const saveRecipe = () => {
    if (!selectedDishId || !recipeInsumoId || !recipeCantidad) return;
    const cant = parseFloat(recipeCantidad);
    if (isNaN(cant) || cant <= 0) return;

    addReceta({
      id: `rec${Date.now()}`,
      dishId: selectedDishId,
      insumoId: recipeInsumoId,
      cantidad: cant,
    });
    setShowRecipeModal(false);
  };

  const getInsumoName = (id: string) => insumos.find(i => i.id === id)?.name || "Desconocido";
  const getInsumoUnit = (id: string) => insumos.find(i => i.id === id)?.unit || "";
  const getDishName = (id: string) => dishes.find(d => d.id === id)?.name || "Desconocido";
  const getDishPrice = (id: string) => dishes.find(d => d.id === id)?.price || 0;
  const getDishCost = (id: string) => dishes.find(d => d.id === id)?.cost || 0;

  const calcDishCost = (dishId: string) => {
    const dishRecetas = recetas.filter(r => r.dishId === dishId);
    return dishRecetas.reduce((sum, r) => {
      const insumo = insumos.find(i => i.id === r.insumoId);
      return sum + (insumo ? r.cantidad * 0 : 0);
    }, getDishCost(dishId));
  };

  return (
    <div className="p-8 h-full overflow-auto bg-background text-foreground transition-colors duration-300 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl text-primary tracking-wide font-medium">Control de Inventario</h1>
            <p className="text-gray-500 text-xs mt-1">Monitorea insumos y gestiona recetas de platillos.</p>
          </div>
          {!isReadOnly && activeTab === "insumos" && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wide transition-colors self-start sm:self-center cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Insumo
            </button>
          )}
          {!isReadOnly && activeTab === "recetas" && (
            <button
              onClick={() => openAddRecipe()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wide transition-colors self-start sm:self-center cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" /> Nueva Receta
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
          {[
            { id: "insumos" as const, label: "Insumos", icon: Boxes, count: insumos.length },
            { id: "recetas" as const, label: "Recetas (Platillos)", icon: ChefHat, count: dishesWithRecipes.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label} <span className="text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* STATS */}
        {activeTab === "insumos" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-3xl text-primary font-light">{insumos.length}</p>
                <p className="text-sm text-foreground mt-1 font-semibold">Total Insumos</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-border">
                <Boxes className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className={`text-3xl font-light ${lowStockCount > 0 ? "text-red-500" : "text-primary"}`}>{lowStockCount}</p>
                <p className="text-sm text-foreground mt-1 font-semibold">Stock Bajo</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                lowStockCount > 0 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-border text-primary"
              }`}>
                <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        )}

        {/* INSUMOS TAB */}
        {activeTab === "insumos" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <h2 className="text-base text-primary tracking-wider uppercase font-semibold">Lista de Insumos</h2>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" strokeWidth={1.5} />
                  <input
                    type="text" placeholder="Buscar insumo..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-4 text-foreground placeholder:text-gray-500 text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <button onClick={() => setSearchQuery("")}
                  className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer">
                  <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-gray-500 text-[10px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Insumo</th>
                    <th className="px-6 py-4 font-semibold">Stock Actual</th>
                    <th className="px-6 py-4 font-semibold">Mínimo</th>
                    <th className="px-6 py-4 font-semibold text-center">Estado</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInsumos.map((insumo) => {
                    const status = getStatus(insumo);
                    const percent = Math.min(100, Math.round((insumo.stockActual / (insumo.stockMinimo * 2.5)) * 100)) || 0;
                    const barColor = insumo.stockActual === 0 ? "bg-red-500" : insumo.stockActual <= insumo.stockMinimo ? "bg-yellow-500" : "bg-primary";
                    return (
                      <tr key={insumo.id} className="hover:bg-primary/2 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-foreground text-sm font-semibold">{insumo.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-40">
                            <div className="flex items-baseline gap-1 mb-1.5">
                              <span className="text-foreground text-sm font-bold">{insumo.stockActual}</span>
                              <span className="text-gray-500 text-xs">{insumo.unit}</span>
                            </div>
                            <div className="w-full h-1 bg-background rounded-full overflow-hidden border border-border/5">
                              <div className={`h-full ${barColor} transition-all duration-300`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500 text-sm">{insumo.stockMinimo} {insumo.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isReadOnly ? (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => adjustStock(insumo, insumo.unit === "L" || insumo.unit === "kg" ? 0.5 : 1)}
                                className="w-7 h-7 rounded bg-background border border-border text-green-500 hover:bg-green-500/10 flex items-center justify-center transition-colors cursor-pointer" title="Aumentar">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => adjustStock(insumo, insumo.unit === "L" || insumo.unit === "kg" ? -0.5 : -1)}
                                className="w-7 h-7 rounded bg-background border border-border text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer" title="Reducir">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleOpenEditModal(insumo)}
                                className="w-7 h-7 rounded bg-background border border-border text-primary hover:bg-primary/10 flex items-center justify-center transition-colors cursor-pointer" title="Editar">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => removeInsumo(insumo.id)}
                                className="w-7 h-7 rounded bg-background border border-border text-gray-500 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors cursor-pointer" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : <span className="text-gray-400 text-xs italic">Solo lectura</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredInsumos.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs">No se encontraron insumos.</div>
              )}
            </div>
          </div>
        )}

        {/* RECETAS TAB */}
        {activeTab === "recetas" && (
          <div className="space-y-4">
            {/* Dishes with recipes */}
            {dishesWithRecipes.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base text-primary tracking-wider uppercase font-semibold">Platillos con Receta</h2>
                </div>
                <div className="divide-y divide-border">
                  {dishesWithRecipes.map(dish => {
                    const dishRecetas = recetas.filter(r => r.dishId === dish.id);
                    const totalCost = dishRecetas.reduce((sum, r) => {
                      const insumo = insumos.find(i => i.id === r.insumoId);
                      return sum + (insumo ? r.cantidad * 0 : 0);
                    }, dish.cost);
                    const margin = dish.price > 0 ? ((dish.price - totalCost) / dish.price * 100).toFixed(0) : "0";
                    return (
                      <div key={dish.id} className="p-5 hover:bg-primary/2 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-foreground font-semibold text-sm">{dish.name}</span>
                            <span className="text-gray-500 text-xs ml-2">${dish.price.toFixed(2)}</span>
                            <span className="text-green-400 text-xs ml-2">Costo: ${dish.cost.toFixed(2)}</span>
                          </div>
                          {!isReadOnly && (
                            <button onClick={() => openAddRecipe(dish.id)}
                              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs hover:bg-amber-500/20 transition-colors cursor-pointer">
                              <Plus className="w-3 h-3" /> Agregar
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {dishRecetas.map(r => (
                            <div key={r.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Link className="w-3 h-3 text-primary" />
                                <span className="text-foreground">{getInsumoName(r.insumoId)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400">{r.cantidad} {getInsumoUnit(r.insumoId)}/platillo</span>
                                {!isReadOnly && (
                                  <button onClick={() => deleteReceta(r.id)}
                                    className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                                    <Unlink className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dishes without recipes */}
            {dishesWithoutRecipes.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-border">
                  <h2 className="text-base text-gray-500 tracking-wider uppercase font-semibold">Sin Receta Asignada</h2>
                </div>
                <div className="divide-y divide-border">
                  {dishesWithoutRecipes.map(dish => (
                    <div key={dish.id} className="p-4 flex items-center justify-between hover:bg-primary/2 transition-colors">
                      <div>
                        <span className="text-foreground text-sm">{dish.name}</span>
                        <span className="text-gray-500 text-xs ml-2">${dish.price.toFixed(2)}</span>
                      </div>
                      {!isReadOnly && (
                        <button onClick={() => openAddRecipe(dish.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-gray-800 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors cursor-pointer">
                          <Plus className="w-3 h-3" /> Asignar Receta
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {dishes.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay platillos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Insumo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm tracking-widest text-primary uppercase font-semibold">
                {editingInsumo ? "Editar Insumo" : "Nuevo Insumo"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-primary transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Nombre del Insumo</label>
                <input type="text" required placeholder="Ej. Pulpo Fresco" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Stock Actual</label>
                  <input type="number" step="0.01" required placeholder="Ej. 15" value={stockActual} onChange={(e) => setStockActual(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Mínimo Crítico</label>
                  <input type="number" step="0.01" required placeholder="Ej. 5" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Unidad de Medida</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                  <option value="kg">Kilogramos (kg)</option>
                  <option value="g">Gramos (g)</option>
                  <option value="L">Litros (L)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="unidades">Unidades</option>
                  <option value="paquetes">Paquetes</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer">
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-sm">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm tracking-widest text-primary uppercase font-semibold">Asignar Receta</h3>
              <button onClick={() => setShowRecipeModal(false)} className="text-gray-500 hover:text-primary transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Platillo</label>
                <select value={selectedDishId} onChange={(e) => setSelectedDishId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                  <option value="">Seleccionar platillo...</option>
                  {dishes.map(d => (
                    <option key={d.id} value={d.id}>{d.name} (${d.price.toFixed(2)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Insumo</label>
                <select value={recipeInsumoId} onChange={(e) => setRecipeInsumoId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer">
                  <option value="">Seleccionar insumo...</option>
                  {insumos.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.stockActual} {i.unit} disponibles)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5">Cantidad por Platillo</label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0.01" placeholder="Ej. 0.3" value={recipeCantidad}
                    onChange={(e) => setRecipeCantidad(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg py-2.5 px-3 text-foreground text-xs focus:outline-none focus:border-primary" />
                  <span className="text-gray-500 text-xs">{recipeInsumoId ? getInsumoUnit(recipeInsumoId) : " unidad"}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Cuánto insumo se consume por cada platillo servido</p>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowRecipeModal(false)}
                  className="flex-1 py-2.5 border border-border text-gray-500 hover:text-foreground rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer">
                  Cancelar
                </button>
                <button onClick={saveRecipe} disabled={!selectedDishId || !recipeInsumoId || !recipeCantidad}
                  className="flex-1 py-2.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50">
                  Guardar Receta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
