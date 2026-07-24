import { useState } from "react";
import { Tag, Plus, Edit2, Trash2, Percent, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { useApp, Descuento } from "../context/AppContext";
import { Modal, ModalBody } from "./ui/Modal";

const emptyForm: Omit<Descuento, "id" | "usosActuales" | "creadoEn"> = {
  codigo: "",
  descripcion: "",
  tipo: "porcentaje",
  valor: 0,
  minPedido: 0,
  activo: true,
  validoDesde: "",
  validoHasta: "",
  usosMaximos: 0,
};

export default function Descuentos() {
  const { descuentos, addDescuento, updateDescuento, deleteDescuento } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (d: Descuento) => {
    setEditingId(d.id);
    setForm({
      codigo: d.codigo,
      descripcion: d.descripcion,
      tipo: d.tipo,
      valor: d.valor,
      minPedido: d.minPedido,
      activo: d.activo,
      validoDesde: d.validoDesde,
      validoHasta: d.validoHasta,
      usosMaximos: d.usosMaximos,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.codigo.trim() || form.valor <= 0) return;
    if (editingId) {
      await updateDescuento(editingId, form);
    } else {
      const now = new Date().toISOString();
      await addDescuento({
        id: `desc_${Date.now()}`,
        ...form,
        codigo: form.codigo.toUpperCase().trim(),
        usosActuales: 0,
        creadoEn: now,
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este descuento?")) return;
    await deleteDescuento(id);
  };

  const toggleActivo = async (d: Descuento) => {
    await updateDescuento(d.id, { activo: !d.activo });
  };

  const fmtDate = (s: string) => {
    if (!s) return "—";
    return new Date(s).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="p-6 h-full overflow-auto bg-background text-foreground">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Descuentos y Promociones</h1>
            <p className="text-gray-400 text-sm">Gestiona cupones y ofertas para tus clientes</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-colors text-sm cursor-pointer">
            <Plus className="w-4 h-4" /> Nuevo Descuento
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <span className="text-gray-500 text-xs">Total descuentos</span>
            <p className="text-2xl font-bold text-white mt-1">{descuentos.length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <span className="text-gray-500 text-xs">Activos</span>
            <p className="text-2xl font-bold text-green-400 mt-1">{descuentos.filter(d => d.activo).length}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <span className="text-gray-500 text-xs">Usos totales</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{descuentos.reduce((s, d) => s + d.usosActuales, 0)}</p>
          </div>
        </div>

        {/* Table */}
        {descuentos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay descuentos creados</p>
            <button onClick={openNew} className="mt-3 text-amber-400 text-sm hover:underline cursor-pointer">Crear el primero</button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">Código</th>
                  <th className="px-5 py-3 text-left font-semibold">Descripción</th>
                  <th className="px-5 py-3 text-center font-semibold">Tipo</th>
                  <th className="px-5 py-3 text-center font-semibold">Valor</th>
                  <th className="px-5 py-3 text-center font-semibold">Mín. Pedido</th>
                  <th className="px-5 py-3 text-center font-semibold">Vigencia</th>
                  <th className="px-5 py-3 text-center font-semibold">Usos</th>
                  <th className="px-5 py-3 text-center font-semibold">Estado</th>
                  <th className="px-5 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {descuentos.map(d => (
                  <tr key={d.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md text-xs font-mono font-bold">
                        {d.codigo}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs max-w-[200px] truncate">{d.descripcion || "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                        {d.tipo === "porcentaje" ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                        {d.tipo === "porcentaje" ? "Porcentaje" : "Monto Fijo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-white font-bold text-sm">
                        {d.tipo === "porcentaje" ? `${d.valor}%` : `$${d.valor}`}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-400 text-xs">
                      {d.minPedido > 0 ? `$${d.minPedido}` : "Sin mínimo"}
                    </td>
                    <td className="px-5 py-3 text-center text-gray-400 text-[10px]">
                      {d.validoDesde || d.validoHasta ? (
                        <span>{fmtDate(d.validoDesde)} — {fmtDate(d.validoHasta)}</span>
                      ) : "Sin límite"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-white text-sm font-bold">{d.usosActuales}</span>
                      {d.usosMaximos > 0 && <span className="text-gray-500 text-xs">/{d.usosMaximos}</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleActivo(d)} className="cursor-pointer">
                        {d.activo ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-600" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(d)}
                          className="text-gray-500 hover:text-amber-400 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(d.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? "Editar Descuento" : "Nuevo Descuento"} maxWidth="md">
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Código del Cupón</label>
                <input type="text" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                  placeholder="Ej. PULPAZO10" maxLength={20}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm font-mono focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Tipo de Descuento</label>
                <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value as Descuento["tipo"] }))}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer">
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="monto_fijo">Monto Fijo ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Descripción</label>
              <input type="text" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Ej. 10% de descuento en pedidos mayores a $200"
                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-amber-500/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">
                  Valor {form.tipo === "porcentaje" ? "(%)" : "($)"}
                </label>
                <input type="number" min="0" step={form.tipo === "porcentaje" ? "1" : "0.01"}
                  value={form.valor || ""} onChange={e => setForm(f => ({ ...f, valor: Number(e.target.value) }))}
                  placeholder="0"
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Pedido Mínimo ($)</label>
                <input type="number" min="0" step="0.01"
                  value={form.minPedido || ""} onChange={e => setForm(f => ({ ...f, minPedido: Number(e.target.value) }))}
                  placeholder="0 = Sin mínimo"
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Válido Desde</label>
                <input type="date" value={form.validoDesde} onChange={e => setForm(f => ({ ...f, validoDesde: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer" />
              </div>
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Válido Hasta</label>
                <input type="date" value={form.validoHasta} onChange={e => setForm(f => ({ ...f, validoHasta: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-amber-500/50 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1.5 font-semibold">Usos Máximos</label>
                <input type="number" min="0"
                  value={form.usosMaximos || ""} onChange={e => setForm(f => ({ ...f, usosMaximos: Number(e.target.value) }))}
                  placeholder="0 = Sin límite"
                  className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex items-end pb-1">
                <button onClick={() => setForm(f => ({ ...f, activo: !f.activo }))}
                  className="flex items-center gap-2 text-sm cursor-pointer">
                  {form.activo ? (
                    <ToggleRight className="w-7 h-7 text-green-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-gray-600" />
                  )}
                  <span className={form.activo ? "text-green-400" : "text-gray-500"}>
                    {form.activo ? "Activo" : "Inactivo"}
                  </span>
                </button>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-gray-400 hover:text-white transition-colors cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSave}
                disabled={!form.codigo.trim() || form.valor <= 0}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black transition-colors cursor-pointer">
                {editingId ? "Guardar Cambios" : "Crear Descuento"}
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
