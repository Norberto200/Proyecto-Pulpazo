import { useState, useRef } from "react";
import { Clock, X, ChevronRight } from "lucide-react";
import { useApp, Table, TableShape, TableStatus } from "../context/AppContext";

const statusLabel: Record<TableStatus, string> = {
  libre: "Libre",
  ocupado: "Ocupado",
  reservado: "Reservado",
};

const statusColor: Record<TableStatus, string> = {
  libre: "#22c55e",
  ocupado: "#ef4444",
  reservado: "#f97316",
};

export default function MapaMesas() {
  const { tables, updateTable, addTable, removeTable } = useApp();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const selectedTable = tables.find((t) => t.id === selectedTableId) || null;

  const handleTableClick = (table: Table) => {
    setSelectedTableId((prev) => (prev === table.id ? null : table.id));
  };

  const closePanel = () => setSelectedTableId(null);

  const handleReservar = () => {
    if (!selectedTableId) return;
    updateTable(selectedTableId, { status: "reservado" });
  };

  const handleLiberar = () => {
    if (!selectedTableId) return;
    updateTable(selectedTableId, { status: "libre", time: undefined });
  };

  const handleAddTable = () => {
    const nextNum = tables.length > 0 ? Math.max(...tables.map((t) => parseInt(t.id.replace(/\D/g, "")) || 0)) + 1 : 1;
    const newId = `M${nextNum}`;
    const newTable = {
      id: newId,
      name: `Mesa ${newId}`,
      type: "circular" as const,
      x: 150,
      y: 150,
      radius: 30,
      rotation: 0,
    };
    addTable(newTable);
    setSelectedTableId(newId);
  };

  const getSVGCoords = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const viewBox = svgRef.current.viewBox.baseVal;
    const x = ((clientX - rect.left) / rect.width) * viewBox.width;
    const y = ((clientY - rect.top) / rect.height) * viewBox.height;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleDragStart = (e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>, table: Table) => {
    if (!editMode) return;
    e.stopPropagation();
    
    setSelectedTableId(table.id);
    
    const coords = getSVGCoords(e as any);
    if (coords) {
      dragOffsetRef.current = {
        x: coords.x - table.x,
        y: coords.y - table.y,
      };
      setDraggingTableId(table.id);
    }
  };

  const handleDragMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!editMode || !draggingTableId) return;
    
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const coords = getSVGCoords(e);
    if (coords) {
      const newX = Math.max(0, Math.min(900, coords.x - dragOffsetRef.current.x));
      const newY = Math.max(0, Math.min(450, coords.y - dragOffsetRef.current.y));
      
      updateTable(draggingTableId, { x: newX, y: newY });
    }
  };

  const handleDragEnd = () => {
    setDraggingTableId(null);
  };

  const counts = {
    libre: tables.filter((t) => t.status === "libre").length,
    ocupado: tables.filter((t) => t.status === "ocupado").length,
    reservado: tables.filter((t) => t.status === "reservado").length,
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Map Area */}
      <div className="flex-1 p-8 transition-all duration-300">
        <div className="bg-[#111111] rounded-xl p-6 h-full border border-[#D4AF37]/20 flex flex-col overflow-hidden">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[#D4AF37]/15 pb-4">
            <div>
              <h2 className="text-xl text-[#D4AF37] tracking-wide">Plano de Mesas</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {editMode ? "Arrastra las mesas libremente por el mapa para posicionarlas" : "Administra las mesas y reservas actuales"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {editMode && (
                <button
                  onClick={handleAddTable}
                  className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wide transition-colors"
                >
                  ＋ Agregar Mesa
                </button>
              )}

              <button
                onClick={() => {
                  setEditMode(!editMode);
                  setSelectedTableId(null);
                }}
                className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  editMode
                    ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/8"
                    : "border-gray-600 text-gray-400 hover:text-white"
                }`}
              >
                {editMode ? "Salir de Edición" : "Editar Mesas"}
              </button>

              {!editMode && (
                <div className="flex gap-3 ml-2 border-l border-[#D4AF37]/20 pl-4">
                  {(["libre", "ocupado", "reservado"] as TableStatus[]).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor[s] }} />
                      <span className="text-[10px] text-gray-400">
                        {statusLabel[s]} <span className="text-gray-600">({counts[s]})</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 bg-[#0a0a0a] rounded-lg border border-[#D4AF37]/10 overflow-hidden relative">
            <svg
              ref={svgRef}
              viewBox="0 0 900 450"
              className="w-full h-full select-none"
              style={{ minHeight: "380px", overflow: "visible" }}
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleDragMove}
              onTouchMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <defs>
                <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="0.5"/>
                </pattern>
                <radialGradient id="floor-vignette" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="transparent"/>
                  <stop offset="100%" stopColor="rgba(0,0,0,0.4)"/>
                </radialGradient>
              </defs>

              {/* Floor */}
              <rect x="-1000" y="-1000" width="2900" height="2450" fill="url(#floor-grid)" rx="8"/>
              <rect x="-1000" y="-1000" width="2900" height="2450" fill="url(#floor-vignette)" rx="8"/>

              {tables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const color = statusColor[table.status];
                
                // Shape sizes
                const r = table.radius || 30;
                const w = table.width || 80;
                const h = table.height || 40;
                const rot = table.rotation || 0;

                const cx = table.type === "circular" ? table.x : table.x + w / 2;
                const cy = table.type === "circular" ? table.y : table.y + h / 2;
                
                const chairFill = "#1e1e1e";
                const chairStroke = isSelected ? "#D4AF37" : color;

                return (
                  <g
                    key={table.id}
                    transform={`translate(${cx}, ${cy}) rotate(${rot})`}
                    onClick={() => !editMode && handleTableClick(table)}
                    onMouseDown={(e) => handleDragStart(e, table)}
                    onTouchStart={(e) => handleDragStart(e, table)}
                    className="cursor-pointer font-sans select-none"
                    style={{ filter: isSelected ? "drop-shadow(0 0 7px #D4AF37)" : `drop-shadow(0 1px 4px rgba(0,0,0,0.6))` }}
                  >
                    {table.type === "circular" ? (
                      <>
                        {/* Chairs at N/S/E/W */}
                        <circle cx={0}   cy={-(r + 8)} r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        <circle cx={0}   cy={r + 8}  r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        <circle cx={-(r + 8)} cy={0}   r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        <circle cx={r + 8}  cy={0}   r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        {/* Table surface */}
                        <circle cx={0} cy={0} r={r}
                          fill={color} fillOpacity={0.82}
                          stroke={isSelected ? "#D4AF37" : "rgba(255,255,255,0.1)"}
                          strokeWidth={isSelected ? 1.8 : 1}
                        />
                        {/* Surface gloss */}
                        <ellipse cx={-5} cy={-r/3} rx={r*0.54} ry={r*0.3} fill="white" fillOpacity={0.07}/>
                        {/* Label */}
                        <text x={0} y={5} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" letterSpacing="1">
                          {table.name}
                        </text>
                        {/* Status dot */}
                        <circle cx={r * 0.7} cy={-r * 0.7} r={3.5} fill={color} stroke="#0a0a0a" strokeWidth={1.2}/>
                      </>
                    ) : (
                      <>
                        {/* Chairs top */}
                        <rect x={-w/2 + 8} y={-h/2 - 11} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        <rect x={w/2 - 26}  y={-h/2 - 11} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        {/* Chairs bottom */}
                        <rect x={-w/2 + 8} y={h/2 + 1} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        <rect x={w/2 - 26}  y={h/2 + 1} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.6}/>
                        {/* Table surface */}
                        <rect x={-w/2} y={-h/2} width={w} height={h} rx={5}
                          fill={color} fillOpacity={0.82}
                          stroke={isSelected ? "#D4AF37" : "rgba(255,255,255,0.1)"}
                          strokeWidth={isSelected ? 1.8 : 1}
                        />
                        {/* Surface gloss */}
                        <rect x={-w/2 + 5} y={-h/2 + 4} width={w - 10} height={h/2 - 4} rx={3} fill="white" fillOpacity={0.07}/>
                        {/* Label */}
                        <text x={0} y={5} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" letterSpacing="1">
                          {table.name}
                        </text>
                        {/* Status dot */}
                        <circle cx={w/2 - 7} cy={-h/2 + 7} r={3.5} fill={color} stroke="#0a0a0a" strokeWidth={1.2}/>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hint */}
          {!selectedTableId && (
            <p className="text-center text-xs text-gray-600 mt-3 tracking-wide flex items-center justify-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {editMode ? "Arrastra una mesa para reposicionarla, o selecciónala para editar sus dimensiones" : "Selecciona una mesa para ver sus detalles"}
            </p>
          )}
        </div>
      </div>

      {/* Sliding Detail Panel */}
      <div
        className="absolute top-0 right-0 h-full flex flex-col bg-[#111111] border-l border-[#D4AF37]/30 transition-all duration-300 overflow-hidden"
        style={{ width: selectedTable ? "300px" : "0px" }}
      >
        {selectedTable && (
          <div className="w-[300px] flex flex-col h-full p-6">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm tracking-[0.18em] text-[#D4AF37] uppercase">
                {editMode ? "Configurar Mesa" : "Detalle de Mesa"}
              </h3>
              <button
                onClick={closePanel}
                className="text-gray-500 hover:text-[#D4AF37] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {editMode ? (
              <div className="space-y-4 flex-1 overflow-auto pr-1">
                {/* Nombre */}
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    value={selectedTable.name}
                    onChange={(e) => updateTable(selectedTable.id, { name: e.target.value })}
                    className="w-full bg-[#0d0d0d] border border-[#D4AF37]/20 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Forma */}
                <div>
                  <label className="block text-[10px] tracking-widest text-gray-500 uppercase mb-1">Forma</label>
                  <select
                    value={selectedTable.type}
                    onChange={(e) => {
                      const newType = e.target.value as TableShape;
                      const updates: Partial<Table> = { type: newType };
                      if (newType === "circular" && !selectedTable.radius) {
                        updates.radius = 30;
                      } else if (newType === "rectangular" && !selectedTable.width) {
                        updates.width = 80;
                        updates.height = 40;
                      }
                      updateTable(selectedTable.id, updates);
                    }}
                    className="w-full bg-[#0d0d0d] border border-[#D4AF37]/20 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="circular">Circular</option>
                    <option value="rectangular">Rectangular</option>
                  </select>
                </div>

                {/* Rotación */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] tracking-widest text-gray-500 uppercase">Rotación</label>
                    <span className="text-xs text-white">{selectedTable.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedTable.rotation || 0}
                    onChange={(e) => updateTable(selectedTable.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-[#D4AF37]"
                  />
                </div>

                {/* Dimensiones */}
                {selectedTable.type === "circular" ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] tracking-widest text-gray-500 uppercase">Radio</label>
                      <span className="text-xs text-white">{selectedTable.radius || 30}px</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={selectedTable.radius || 30}
                      onChange={(e) => updateTable(selectedTable.id, { radius: parseInt(e.target.value) })}
                      className="w-full accent-[#D4AF37]"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] tracking-widest text-gray-500 uppercase">Ancho</label>
                        <span className="text-xs text-white">{selectedTable.width || 80}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="140"
                        value={selectedTable.width || 80}
                        onChange={(e) => updateTable(selectedTable.id, { width: parseInt(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] tracking-widest text-gray-500 uppercase">Alto</label>
                        <span className="text-xs text-white">{selectedTable.height || 40}px</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={selectedTable.height || 40}
                        onChange={(e) => updateTable(selectedTable.id, { height: parseInt(e.target.value) })}
                        className="w-full accent-[#D4AF37]"
                      />
                    </div>
                  </div>
                )}

                {/* Acciones de Edición */}
                <div className="pt-4 border-t border-[#D4AF37]/15">
                  <button
                    onClick={() => {
                      removeTable(selectedTable.id);
                      setSelectedTableId(null);
                    }}
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors"
                  >
                    Eliminar Mesa
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 flex-1">
                {/* Mesa */}
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#D4AF37]/15">
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Mesa</p>
                  <p className="text-white text-3xl font-light">{selectedTable.name}</p>
                </div>

                {/* Estado */}
                <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#D4AF37]/15">
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-2">Estado</p>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: statusColor[selectedTable.status] }}
                    />
                    <span className="text-white capitalize">{statusLabel[selectedTable.status]}</span>
                  </div>
                </div>

                {/* Tiempo */}
                {selectedTable.status === "ocupado" && selectedTable.time && (
                  <div className="bg-[#0d0d0d] rounded-lg p-4 border border-[#D4AF37]/15">
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-2">Tiempo en Mesa</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.5} />
                      <span className="text-white">{selectedTable.time}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions (Solo en Modo Servicio) */}
            {!editMode && (
              <div className="space-y-3 pt-4 border-t border-[#D4AF37]/15">
                {selectedTable.status === "libre" && (
                  <button
                    onClick={handleReservar}
                    className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors"
                  >
                    Reservar Mesa
                  </button>
                )}
                {selectedTable.status === "ocupado" && (
                  <button
                    onClick={handleLiberar}
                    className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors"
                  >
                    Liberar Mesa
                  </button>
                )}
                {selectedTable.status === "reservado" && (
                  <button
                    onClick={handleLiberar}
                    className="w-full bg-[#D4AF37] hover:bg-[#C9A830] text-black py-3 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors"
                  >
                    Cancelar Reserva
                  </button>
                )}
                <button
                  onClick={closePanel}
                  className="w-full border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
            
            {editMode && (
              <div className="pt-4 border-t border-[#D4AF37]/15">
                <button
                  onClick={closePanel}
                  className="w-full border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-colors"
                >
                  Listo / Cerrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
