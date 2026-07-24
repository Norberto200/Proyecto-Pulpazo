import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Clock, X, ChevronRight, UtensilsCrossed, Plus } from "lucide-react";
import { useApp, Table, TableShape, TableStatus } from "../context/AppContext";
import { statusColor, statusLabel } from "../lib/utils";

export default function MapaMesas() {
  const { tables, updateTable, addTable, removeTable, userRole, orders, updateOrderStatus, setCurrentTableId } = useApp();

  const canEditTables = userRole === "administrador" || userRole === "cajera";
  const canCloseTable = userRole === "administrador" || userRole === "cajera";
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

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
    // Mark pending orders for this table as completado
    orders
      .filter((o) => o.table === selectedTableId && o.status === "pendiente")
      .forEach((o) => updateOrderStatus(o.id, "completado"));
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
    <div className="relative flex h-full overflow-hidden font-sans bg-background text-foreground transition-colors duration-300">
      {/* Map Area */}
      <div className="flex-1 p-8 transition-all duration-300">
        <div className="bg-card rounded-xl p-6 h-full border border-border flex flex-col overflow-hidden shadow-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-border pb-4">
            <div>
              <h2 className="text-xl text-primary tracking-wide">Plano de Mesas</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                {editMode ? "Arrastra las mesas libremente por el mapa para posicionarlas" : "Administra las mesas y reservas actuales"}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {editMode && (
                <button
                  onClick={handleAddTable}
                  className="px-3.5 py-1.5 bg-primary hover:bg-[#C9A830] text-black rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  ＋ Agregar Mesa
                </button>
              )}

              {/* Only admin and cajera can edit tables */}
              {canEditTables && (
                <button
                  onClick={() => {
                    setEditMode(!editMode);
                    setSelectedTableId(null);
                  }}
                  className={`px-3.5 py-1.5 border rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                    editMode
                      ? "border-primary text-primary bg-primary/8"
                      : "border-border text-gray-500 hover:text-foreground"
                  }`}
                >
                  {editMode ? "Salir de Edición" : "Editar Mesas"}
                </button>
              )}

              {!editMode && (
                <div className="flex gap-3 ml-2 border-l border-border pl-4">
                  {(["libre", "ocupado", "reservado"] as TableStatus[]).map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor[s] }} />
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {statusLabel[s]} <span className="text-gray-500 font-normal">({counts[s]})</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 bg-background rounded-lg border border-border overflow-hidden relative">
            <svg
              ref={svgRef}
              viewBox="0 0 900 450"
              className="w-full h-full select-none"
              style={{ overflow: "visible" }}
              onMouseMove={handleDragMove}
              onTouchMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onTouchEnd={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <defs>
                <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(212,175,55,0.06)" strokeWidth="0.5"/>
                </pattern>
                <radialGradient id="floor-vignette" cx="50%" cy="50%" r="50%">
                  <stop offset="60%" stopColor="transparent"/>
                  <stop offset="100%" stopColor="rgba(0,0,0,0.05)"/>
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
                
                const chairFill = "var(--card)";
                const chairStroke = isSelected ? "var(--primary)" : color;

                return (
                  <g
                    key={table.id}
                    transform={`translate(${cx}, ${cy}) rotate(${rot})`}
                    onClick={() => !editMode && handleTableClick(table)}
                    onMouseDown={(e) => handleDragStart(e, table)}
                    onTouchStart={(e) => handleDragStart(e, table)}
                    className="cursor-pointer font-sans select-none"
                    style={{ filter: isSelected ? "drop-shadow(0 0 7px #D4AF37)" : `drop-shadow(0 1px 4px rgba(0,0,0,0.15))` }}
                  >
                    {table.type === "circular" ? (
                      <>
                        {/* Chairs at N/S/E/W */}
                        <circle cx={0}   cy={-(r + 8)} r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        <circle cx={0}   cy={r + 8}  r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        <circle cx={-(r + 8)} cy={0}   r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        <circle cx={r + 8}  cy={0}   r={8} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        {/* Table surface */}
                        <circle cx={0} cy={0} r={r}
                          fill={color} fillOpacity={0.85}
                          stroke={isSelected ? "var(--primary)" : "rgba(255,255,255,0.15)"}
                          strokeWidth={isSelected ? 1.8 : 1}
                        />
                        {/* Surface gloss */}
                        <ellipse cx={-5} cy={-r/3} rx={r*0.54} ry={r*0.3} fill="white" fillOpacity={0.15}/>
                        {/* Label */}
                        <text x={0} y={4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.5">
                          {table.name}
                        </text>
                        {/* Status dot */}
                        <circle cx={r * 0.7} cy={-r * 0.7} r={3.5} fill={color} stroke="var(--card)" strokeWidth={1.2}/>
                      </>
                    ) : (
                      <>
                        {/* Chairs top */}
                        <rect x={-w/2 + 8} y={-h/2 - 11} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        <rect x={w/2 - 26}  y={-h/2 - 11} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        {/* Chairs bottom */}
                        <rect x={-w/2 + 8} y={h/2 + 1} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        <rect x={w/2 - 26}  y={h/2 + 1} width={18} height={10} rx={3} fill={chairFill} stroke={chairStroke} strokeWidth={0.8} strokeOpacity={0.8}/>
                        {/* Table surface */}
                        <rect x={-w/2} y={-h/2} width={w} height={h} rx={5}
                          fill={color} fillOpacity={0.85}
                          stroke={isSelected ? "var(--primary)" : "rgba(255,255,255,0.15)"}
                          strokeWidth={isSelected ? 1.8 : 1}
                        />
                        {/* Surface gloss */}
                        <rect x={-w/2 + 5} y={-h/2 + 4} width={w - 10} height={h/2 - 4} rx={3} fill="white" fillOpacity={0.15}/>
                        {/* Label */}
                        <text x={0} y={4} textAnchor="middle" fill="white" fontSize="10" fontWeight="700" letterSpacing="0.5">
                          {table.name}
                        </text>
                        {/* Status dot */}
                        <circle cx={w/2 - 7} cy={-h/2 + 7} r={3.5} fill={color} stroke="var(--card)" strokeWidth={1.2}/>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Hint */}
          {!selectedTableId && (
            <p className="text-center text-xs text-gray-500 mt-3 tracking-wide flex items-center justify-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {editMode ? "Arrastra una mesa para reposicionarla, o selecciónala para editar sus dimensiones" : "Selecciona una mesa para ver sus detalles o iniciar un pedido"}
            </p>
          )}
        </div>
      </div>

      {/* Sliding Detail Panel */}
      <div
        className="absolute top-0 right-0 h-full flex flex-col bg-card border-l border-border transition-all duration-300 overflow-hidden shadow-xl"
        style={{ width: selectedTable ? "300px" : "0px" }}
      >
        {selectedTable && (
          <div className="w-[300px] flex flex-col h-full p-6">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm tracking-[0.18em] text-primary uppercase font-semibold">
                {editMode ? "Configurar Mesa" : "Detalle de Mesa"}
              </h3>
              <button
                onClick={closePanel}
                className="text-gray-500 hover:text-primary transition-colors cursor-pointer"
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
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
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
                    className="w-full bg-background border border-border rounded-lg py-2 px-3 text-foreground text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="rectangular">Rectangular</option>
                    <option value="circular">Circular</option>
                  </select>
                </div>

                {/* Rotación */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] tracking-widest text-gray-500 uppercase">Rotación</label>
                    <span className="text-xs text-foreground font-semibold">{selectedTable.rotation || 0}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedTable.rotation || 0}
                    onChange={(e) => updateTable(selectedTable.id, { rotation: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Dimensions */}
                {selectedTable.type === "circular" ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] tracking-widest text-gray-500 uppercase">Radio</label>
                      <span className="text-xs text-foreground font-semibold">{selectedTable.radius || 30}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={selectedTable.radius || 30}
                      onChange={(e) => updateTable(selectedTable.id, { radius: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] tracking-widest text-gray-500 uppercase">Ancho</label>
                        <span className="text-xs text-foreground font-semibold">{selectedTable.width || 80}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="140"
                        value={selectedTable.width || 80}
                        onChange={(e) => updateTable(selectedTable.id, { width: parseInt(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] tracking-widest text-gray-500 uppercase">Alto</label>
                        <span className="text-xs text-foreground font-semibold">{selectedTable.height || 40}px</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={selectedTable.height || 40}
                        onChange={(e) => updateTable(selectedTable.id, { height: parseInt(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Acciones de Edición */}
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      removeTable(selectedTable.id);
                      setSelectedTableId(null);
                    }}
                    className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white py-2.5 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors cursor-pointer"
                  >
                    Eliminar Mesa
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 flex-1">
                {/* Mesa */}
                <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">Mesa</p>
                  <p className="text-foreground text-3xl font-light">{selectedTable.name}</p>
                </div>

                {/* Estado */}
                <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                  <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-2">Estado</p>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: statusColor[selectedTable.status] }}
                    />
                    <span className="text-foreground font-medium capitalize">{statusLabel[selectedTable.status]}</span>
                  </div>
                </div>

                {/* Tiempo */}
                {selectedTable.status === "ocupado" && selectedTable.time && (
                  <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
                    <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-2">Tiempo en Mesa</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-foreground font-semibold">{selectedTable.time}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions (Solo en Modo Servicio) */}
            {!editMode && (
              <div className="space-y-3 pt-4 border-t border-border">
                {selectedTable.status === "libre" && (
                  <>
                    <button
                      onClick={() => {
                        // Set current table in context (table stays libre until order is placed)
                        setCurrentTableId(selectedTable.id);
                        navigate("/dashboard/cliente-menu");
                      }}
                      className="w-full bg-primary hover:bg-[#C9A830] text-black py-3 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" /> Iniciar Venta / Abrir
                    </button>
                    <button
                      onClick={handleReservar}
                      className="w-full border border-border hover:bg-background text-foreground py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-colors cursor-pointer"
                    >
                      Reservar Mesa
                    </button>
                  </>
                )}
                {selectedTable.status === "ocupado" && (
                  <>
                    <button
                      onClick={() => {
                        setCurrentTableId(selectedTable.id);
                        navigate("/dashboard/cliente-menu");
                      }}
                      className="w-full bg-primary hover:bg-[#C9A830] text-black py-3 rounded-lg text-xs tracking-[0.18em] uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar a Orden
                    </button>
                    
                    {/* Only cashier and admin can close account (liberar mesa) */}
                    {canCloseTable && (
                      <button
                        onClick={handleLiberar}
                        className="w-full border border-border text-foreground hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30 py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-all cursor-pointer"
                      >
                        Liberar / Cobrar Mesa
                      </button>
                    )}
                  </>
                )}
                {selectedTable.status === "reservado" && (
                  <button
                    onClick={handleLiberar}
                    className="w-full border border-border text-foreground hover:bg-[#ef4444]/10 hover:text-[#ef4444] hover:border-[#ef4444]/30 py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-all cursor-pointer"
                  >
                    Cancelar Reserva
                  </button>
                )}
                <button
                  onClick={closePanel}
                  className="w-full border border-border text-gray-500 hover:text-foreground py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-colors cursor-pointer"
                >
                  Cerrar Detalles
                </button>
              </div>
            )}
            
            {editMode && (
              <div className="pt-4 border-t border-border">
                <button
                  onClick={closePanel}
                  className="w-full border border-border text-gray-500 hover:text-foreground py-3 rounded-lg text-xs tracking-[0.18em] uppercase transition-colors cursor-pointer"
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
