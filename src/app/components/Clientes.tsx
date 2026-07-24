import { useState } from "react";
import { Search, Plus, Phone, MapPin, Trash2, Edit, User, X } from "lucide-react";
import { useApp, Cliente } from "../context/AppContext";
import { Modal, ModalBody, ModalFooter } from "./ui/Modal";

const emptyCliente: Omit<Cliente, "id"> = {
  name: "",
  phone: "",
  address: "",
  street: "",
  number: "",
  neighborhood: "",
  colony: "",
  postalCode: "",
  reference: "",
  defaultPayment: "Efectivo",
  notes: "",
};

function ClienteForm({
  value,
  onChange,
}: {
  value: Omit<Cliente, "id">;
  onChange: (fields: Partial<Cliente>) => void;
}) {
  const input =
    "w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary";
  const label = "block text-[10px] tracking-widest text-gray-500 uppercase mb-1";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="sm:col-span-2">
        <label className={label}>Nombre *</label>
        <input className={input} placeholder="Nombre completo" value={value.name} onChange={(e) => onChange({ name: e.target.value })} />
      </div>
      <div>
        <label className={label}>Telefono</label>
        <input className={input} placeholder="10 digitos" value={value.phone} onChange={(e) => onChange({ phone: e.target.value })} />
      </div>
      <div>
        <label className={label}>Pago default</label>
        <select className={input} value={value.defaultPayment} onChange={(e) => onChange({ defaultPayment: e.target.value as Cliente["defaultPayment"] })}>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta de Crédito/Débito">Tarjeta</option>
        </select>
      </div>
      <div>
        <label className={label}>Calle</label>
        <input className={input} value={value.street} onChange={(e) => onChange({ street: e.target.value })} />
      </div>
      <div>
        <label className={label}>Numero</label>
        <input className={input} value={value.number} onChange={(e) => onChange({ number: e.target.value })} />
      </div>
      <div>
        <label className={label}>Colonia</label>
        <input className={input} value={value.neighborhood} onChange={(e) => onChange({ neighborhood: e.target.value })} />
      </div>
      <div>
        <label className={label}>Fraccionamiento</label>
        <input className={input} value={value.colony} onChange={(e) => onChange({ colony: e.target.value })} />
      </div>
      <div>
        <label className={label}>Codigo Postal</label>
        <input className={input} value={value.postalCode} onChange={(e) => onChange({ postalCode: e.target.value })} />
      </div>
      <div>
        <label className={label}>Referencia</label>
        <input className={input} value={value.reference} onChange={(e) => onChange({ reference: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Direccion completa</label>
        <input className={input} value={value.address} onChange={(e) => onChange({ address: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <label className={label}>Notas</label>
        <input className={input} value={value.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      </div>
    </div>
  );
}

export default function Clientes() {
  const { clientes, addCliente, updateCliente, deleteCliente } = useApp();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cliente, "id">>(emptyCliente);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = clientes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.neighborhood.toLowerCase().includes(search.toLowerCase()) ||
      c.street.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyCliente);
    setShowModal(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingId(c.id);
    setForm({ ...c });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateCliente(editingId, form);
    } else {
      addCliente(form);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCliente(deleteId);
      setDeleteId(null);
    }
  };

  const fullAddress = (c: Cliente) => {
    const parts = [c.street, c.number, c.neighborhood, c.colony, c.postalCode].filter(Boolean);
    return parts.join(", ") || c.address || "Sin direccion";
  };

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl text-primary tracking-wide">Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">{clientes.length} clientes registrados</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary hover:bg-[#C9A830] text-black px-5 py-2.5 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Buscar por nombre, telefono, colonia o calle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-primary/25 rounded-lg py-2.5 pl-9 pr-4 text-white placeholder:text-gray-600 text-xs focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-[10px]">
              Limpiar
            </button>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <User className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
            <p className="text-gray-500 text-sm">{search ? "No se encontraron clientes" : "No hay clientes registrados"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <div key={c.id} className="bg-[#111] border border-primary/20 rounded-xl p-4 flex items-center gap-4 hover:border-primary/35 transition-all">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-sm font-bold">{c.name.charAt(0).toUpperCase()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-medium">{c.name}</span>
                    <span className="text-[9px] text-gray-500 bg-primary/8 px-2 py-0.5 rounded-full">{c.defaultPayment}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {c.phone && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {fullAddress(c)}
                    </span>
                  </div>
                  {c.notes && (
                    <p className="text-[10px] text-yellow-500/70 mt-1 italic">{c.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary/8 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setDeleteId(c.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/8 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Editar Cliente" : "Nuevo Cliente"} maxWidth="md">
        <ModalBody>
          <ClienteForm value={form} onChange={(fields) => setForm((prev) => ({ ...prev, ...fields }))} />
        </ModalBody>
        <div className="px-5 pb-5">
          <ModalFooter>
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 border border-border text-gray-500 hover:text-foreground py-2.5 rounded-lg text-xs tracking-wider transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex-1 bg-primary hover:bg-[#C9A830] text-black py-2.5 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors cursor-pointer disabled:opacity-40"
            >
              {editingId ? "Guardar Cambios" : "Registrar Cliente"}
            </button>
          </ModalFooter>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar Cliente" maxWidth="xs">
        <ModalBody>
          <p className="text-gray-400 text-xs">
            Se eliminara el registro de <span className="text-white font-semibold">{clientes.find((c) => c.id === deleteId)?.name}</span>. Esta accion no se puede deshacer.
          </p>
        </ModalBody>
        <div className="px-5 pb-5">
          <ModalFooter>
            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 border border-border text-gray-500 hover:text-foreground py-2.5 rounded-lg text-xs tracking-wider transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors cursor-pointer"
            >
              Eliminar
            </button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
