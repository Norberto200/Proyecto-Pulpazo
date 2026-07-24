import { useState } from "react";
import { ShoppingCart, Star, Plus, Check, Search } from "lucide-react";
import { useApp, Dish } from "../context/AppContext";

type Category = "Todos" | "Entradas" | "Platos Fuertes" | "Bebidas" | "Postres" | "Recomendados";

const tabs: Category[] = ["Todos", "Recomendados", "Entradas", "Platos Fuertes", "Bebidas", "Postres"];

export default function ClienteMenu() {
  const { addToCart, cartCount, cartItems, dishes, currentTableId } = useApp();
  const [activeTab, setActiveTab] = useState<Category>("Todos");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = dishes.filter((d) => {
    const matchesTab =
      activeTab === "Todos" ? d.available
      : activeTab === "Recomendados" ? d.recommended && d.available
      : d.category === activeTab && d.available;
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAdd = (dish: Dish) => {
    addToCart({ id: dish.id, name: dish.name, price: dish.price, image: dish.image, category: String(dish.category) });
    setJustAdded(dish.id);
    setTimeout(() => setJustAdded(null), 1200);
  };

  const inCart = (id: string) => cartItems.some((i) => i.id === id);

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Menú del Restaurante</h1>
            <p className="text-gray-500 text-sm mt-1">Selecciona los platillos que deseas ordenar</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Buscar platillo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111] border border-primary/25 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder:text-gray-600 text-xs focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-[10px] font-sans">
                  Limpiar
                </button>
              )}
            </div>

            {cartCount > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full justify-center">
                <ShoppingCart className="w-4 h-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm text-primary whitespace-nowrap">{cartCount} {cartCount === 1 ? "platillo" : "platillos"}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-primary/20 mb-7 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs tracking-wider whitespace-nowrap border-b-2 -mb-px transition-all ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-primary"
              }`}>
              {tab === "Recomendados" ? "★ Chef" : tab}
            </button>
          ))}
        </div>

        {/* Recomendados banner */}
        {activeTab === "Recomendados" && (
          <div className="flex items-center gap-3 mb-6 bg-primary/8 border border-primary/25 rounded-xl px-5 py-3">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <p className="text-sm text-primary/80">Selección especial del chef — los favoritos de la casa</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((dish) => {
            const added = justAdded === dish.id;
            const alreadyIn = inCart(dish.id);
            return (
              <div key={dish.id} className="bg-[#111] rounded-xl overflow-hidden border border-primary/15 hover:border-primary/35 transition-all group">
                <div className="relative h-44 overflow-hidden">
                   <img src={dish.image} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                  {dish.recommended && (
                    <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary fill-primary" />
                      <span className="text-[10px] text-primary">Chef</span>
                    </div>
                  )}
                  <div className="absolute bottom-2.5 right-2.5 bg-primary text-black px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    ${dish.price.toFixed(2)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white text-sm mb-1 tracking-wide">{dish.name}</h3>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{dish.description}</p>
                  <button
                    onClick={() => handleAdd(dish)}
                    className={`w-full py-2.5 rounded-lg text-xs tracking-wider font-semibold flex items-center justify-center gap-2 transition-all ${
                      added
                        ? "bg-[#22c55e] text-white"
                        : alreadyIn
                        ? "bg-primary/20 border border-primary/60 text-primary"
                        : "bg-primary hover:bg-[#C9A830] text-black"
                    }`}
                  >
                    {added ? (
                      <><Check className="w-3.5 h-3.5" /> Agregado</>
                    ) : alreadyIn ? (
                      <><Plus className="w-3.5 h-3.5" /> Agregar Otro</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Agregar al Carrito</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
