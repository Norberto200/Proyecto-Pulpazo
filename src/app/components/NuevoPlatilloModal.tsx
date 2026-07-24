import { useState } from "react";
import { X, Camera } from "lucide-react";
import { Dish, DishCategory } from "../context/AppContext";

interface NuevoPlatilloModalProps {
  onClose: () => void;
  onSave: (dish: {
    name: string;
    description: string;
    price: number;
    cost: number;
    category: DishCategory;
    available: boolean;
    image: string;
  }) => void;
  dishToEdit?: Dish;
}

export default function NuevoPlatilloModal({ onClose, onSave, dishToEdit }: NuevoPlatilloModalProps) {
  const [name, setName] = useState(dishToEdit?.name || "");
  const [price, setPrice] = useState(dishToEdit?.price?.toString() || "");
  const [cost, setCost] = useState(dishToEdit?.cost?.toString() || "0");
  const [description, setDescription] = useState(dishToEdit?.description || "");
  const [category, setCategory] = useState<DishCategory>(dishToEdit?.category || "Platos Fuertes");
  const [imagePreview, setImagePreview] = useState<string>(dishToEdit?.image || "");

  const handleSave = () => {
    if (name && price && description) {
      onSave({
        name,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost) || 0,
        category,
        available: dishToEdit ? dishToEdit.available : true,
        image: imagePreview || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-2xl border border-primary/30 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/20">
          <h2 className="text-2xl text-primary tracking-wide uppercase">
            {dishToEdit ? "EDITAR PLATILLO" : "AÑADIR NUEVO PLATILLO"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-primary transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              FOTO DEL PLATILLO
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary/60 transition-colors bg-[#0d0d0d]"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-12 h-12 text-primary" strokeWidth={1.5} />
                    <span className="text-sm text-gray-400">Click para subir imagen</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              NOMBRE DEL PLATILLO
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Pulpo a la Gallega"
              className="w-full bg-[#0d0d0d] border border-primary/30 rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              CATEGORÍA
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DishCategory)}
              className="w-full bg-[#0d0d0d] border border-primary/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
            >
              <option value="Entradas">Entradas</option>
              <option value="Platos Fuertes">Platos Fuertes</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Postres">Postres</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              PRECIO DE VENTA
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">$</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0d0d0d] border border-primary/30 rounded-lg py-3 pl-8 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              COSTO DE PRODUCCIÓN
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0d0d0d] border border-primary/30 rounded-lg py-3 pl-8 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Costo de ingredientes para calcular utilidad</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 tracking-wide">
              DESCRIPCIÓN
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el platillo..."
              rows={4}
              className="w-full bg-[#0d0d0d] border border-primary/30 rounded-lg py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 p-6 border-t border-primary/20">
          <button
            onClick={onClose}
            className="flex-1 border border-primary text-primary hover:bg-primary/10 py-3 rounded-lg transition-colors tracking-wide text-xs font-semibold"
          >
            CANCELAR
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-[#C4A137] text-black py-3 rounded-lg transition-colors tracking-wide text-xs font-semibold"
          >
            {dishToEdit ? "GUARDAR CAMBIOS" : "GUARDAR PLATILLO"}
          </button>
        </div>
      </div>
    </div>
  );
}
