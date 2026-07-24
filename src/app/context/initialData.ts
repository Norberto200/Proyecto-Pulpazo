import type { Dish, Table, Insumo, Cliente, Gasto, Abono, Promotor, Entrega, DishIngredient } from "./types";

export const initialDishes: Dish[] = [
  { id: "1", name: "Ceviche Mixto", description: "Camarón y pescado fresco marinado en limón, cilantro, cebolla morada y aguacate", price: 169.00, cost: 65.00, category: "Entradas", available: true, recommended: true, image: "https://images.unsplash.com/photo-1534080391025-a77c7f46654e?w=400&h=300&fit=crop" },
  { id: "2", name: "Tostada de Mariscos", description: "Tostada crujiente con ceviche de camarón, pulpo y aderezo especial de chipotle", price: 85.00, cost: 30.00, category: "Entradas", available: true, recommended: true, image: "https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&h=300&fit=crop" },
  { id: "3", name: "Cóctel de Camarón", description: "Camarones selectos en nuestra salsa coctelera artesanal con cilantro y aguacate", price: 145.00, cost: 55.00, category: "Entradas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1559058922-4c2c2c8d9f1d?w=400&h=300&fit=crop" },
  { id: "4", name: "Filete al Mojo de Ajo", description: "Filete de pescado a la plancha bañado en ajo dorado al sartén, servido con arroz y ensalada", price: 189.00, cost: 75.00, category: "Platos Fuertes", available: true, recommended: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop" },
  { id: "5", name: "Caldo de Mariscos", description: "Tradicional sopa caliente de la casa con camarón, pulpo, almejas y verduras", price: 195.00, cost: 80.00, category: "Platos Fuertes", available: true, recommended: false, image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop" },
  { id: "6", name: "Michelada Pescadora", description: "Cerveza fría preparada con nuestra mezcla secreta de salsas negras, limón y clamato", price: 95.00, cost: 25.00, category: "Bebidas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1596546335970-1dfa5d0a4126?w=400&h=300&fit=crop" },
  { id: "7", name: "Agua de Horchata", description: "Agua fresca tradicional con canela y un toque cremoso", price: 35.00, cost: 5.00, category: "Bebidas", available: true, recommended: false, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=300&fit=crop" },
  { id: "8", name: "Pay de Limón", description: "Pay cremoso helado con galleta maría y ralladura de limón fresco", price: 65.00, cost: 18.00, category: "Postres", available: true, recommended: true, image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&h=300&fit=crop" },
];

export const initialTables: Table[] = [
  { id: "A1", name: "A1", type: "rectangular", status: "libre", x: 50, y: 80, width: 80, height: 40 },
  { id: "A2", name: "A2", type: "rectangular", status: "ocupado", x: 150, y: 80, width: 80, height: 40, time: "00:45 h" },
  { id: "A3", name: "A3", type: "rectangular", status: "reservado", x: 250, y: 80, width: 80, height: 40 },
  { id: "A4", name: "A4", type: "rectangular", status: "libre", x: 350, y: 80, width: 80, height: 40 },
  { id: "B1", name: "B1", type: "circular", status: "libre", x: 85, y: 180, radius: 30 },
  { id: "B2", name: "B2", type: "circular", status: "ocupado", x: 185, y: 180, radius: 30, time: "01:15 h" },
  { id: "B3", name: "B3", type: "circular", status: "libre", x: 285, y: 180, radius: 30 },
  { id: "B4", name: "B4", type: "circular", status: "reservado", x: 385, y: 180, radius: 30 },
  { id: "C1", name: "C1", type: "rectangular", status: "ocupado", x: 50, y: 280, width: 80, height: 40, time: "01:24 h" },
  { id: "C2", name: "C2", type: "rectangular", status: "libre", x: 150, y: 280, width: 80, height: 40 },
  { id: "C3", name: "C3", type: "rectangular", status: "ocupado", x: 250, y: 280, width: 80, height: 40, time: "00:30 h" },
  { id: "C4", name: "C4", type: "rectangular", status: "libre", x: 350, y: 280, width: 80, height: 40 },
  { id: "D1", name: "D1", type: "circular", status: "reservado", x: 85, y: 380, radius: 30 },
  { id: "D2", name: "D2", type: "circular", status: "libre", x: 185, y: 380, radius: 30 },
  { id: "D3", name: "D3", type: "circular", status: "ocupado", x: 285, y: 380, radius: 30, time: "02:10 h" },
  { id: "D4", name: "D4", type: "circular", status: "libre", x: 385, y: 380, radius: 30 },
];

export const initialInsumos: Insumo[] = [
  { id: "i1", name: "Pulpo Fresco", stockActual: 15, stockMinimo: 5, unit: "kg" },
  { id: "i2", name: "Aceite de Oliva", stockActual: 10, stockMinimo: 2, unit: "L" },
  { id: "i3", name: "Pimentón de la Vera", stockActual: 2, stockMinimo: 0.5, unit: "kg" },
  { id: "i4", name: "Patatas Cocidas", stockActual: 40, stockMinimo: 10, unit: "kg" },
  { id: "i5", name: "Sal de Grano", stockActual: 1.2, stockMinimo: 2, unit: "kg" },
];

export const initialClientes: Cliente[] = [
  { id: "c1", name: "Juan Pérez", phone: "5551234567", address: "Av. Marina 123, Col. Centro", street: "Av. Marina", number: "123", neighborhood: "Centro", colony: "Centro", postalCode: "88000", reference: "Frente al Oxxo", defaultPayment: "Efectivo", notes: "" },
  { id: "c2", name: "María Gómez", phone: "5559876543", address: "Calle Acuario 45, Fracc. Las Olas", street: "Calle Acuario", number: "45", neighborhood: "Las Olas", colony: "Fracc. Las Olas", postalCode: "88001", reference: "Casa azul", defaultPayment: "Tarjeta de Crédito/Débito", notes: "Cliente frecuente" },
  { id: "c3", name: "Carlos López", phone: "5554567890", address: "Blvd. Costero 789, Depto 4", street: "Blvd. Costero", number: "789", neighborhood: "Depto 4", colony: "Costa Verde", postalCode: "88002", reference: "Edificio blanco", defaultPayment: "Efectivo", notes: "" },
];

export const initialGastos: Gasto[] = [
  { id: "g1", description: "Compra de Tortillas (Proveedor)", amount: 350.00, category: "Materia Prima", date: "2026-07-10T11:00:00" },
  { id: "g2", description: "Refrescos Coca-Cola (Distribuidora)", amount: 1200.00, category: "Bebidas", date: "2026-07-10T12:30:00" },
  { id: "g3", description: "Cerveza Corona (Modelo)", amount: 2500.00, category: "Bebidas", date: "2026-07-10T14:00:00" },
];

export const initialAbonos: Abono[] = [
  { id: "a1", clientName: "Felipe Soto (Fiado)", amount: 500.00, date: "2026-07-10T13:15:00" },
];

export const initialPromotores: Promotor[] = [
  { id: "p1", name: "Distribuidora La Costeña", brand: "Coca-Cola", contact: "Roberto Méndez", phone: "5551001001", type: "Coca-Cola", notes: "Entrega semanal los lunes", active: true, dateAdded: "2026-07-01T10:00:00" },
  { id: "p2", name: "Bebidas del Norte", brand: "Pepsi", contact: "Ana García", phone: "5551002002", type: "Pepsi", notes: "Entrega quincenal", active: true, dateAdded: "2026-07-03T10:00:00" },
  { id: "p3", name: "Pescadería El Puerto", brand: "Pescaderia", contact: "Carlos Marín", phone: "5551003003", type: "Pescaderia", notes: "Pescados y mariscos frescos diarios", active: true, dateAdded: "2026-07-05T10:00:00" },
  { id: "p4", name: "Cervecería del Pacífico", brand: "Cerveceria", contact: "Luis Herrera", phone: "5551004004", type: "Cerveceria", notes: "Cervezas artesanales y comerciales", active: true, dateAdded: "2026-07-07T10:00:00" },
];

export const initialEntregas: Entrega[] = [
  { id: "e1", promotorId: "p1", type: "recepcion", description: "Refrescos Coca-Cola 600ml", quantity: "12 cajas", date: "2026-07-22", time: "09:00", status: "entregado", notes: "Pedido semanal" },
  { id: "e2", promotorId: "p3", type: "recepcion", description: "Camarón fresco", quantity: "15 kg", date: "2026-07-22", time: "07:00", status: "entregado", notes: "" },
  { id: "e3", promotorId: "p2", type: "recepcion", description: "Pepsi y 7Up 600ml", quantity: "8 cajas", date: "2026-07-23", time: "10:00", status: "pendiente", notes: "" },
  { id: "e4", promotorId: "p4", type: "recepcion", description: "Cerveza Corona Extra", quantity: "6 cajas", date: "2026-07-23", time: "11:00", status: "pendiente", notes: "Pedido quincenal" },
  { id: "e5", promotorId: "p1", type: "envio", description: "Pedido catering evento", quantity: "200 refrescos", date: "2026-07-25", time: "14:00", status: "pendiente", address: "Av. del Mar 500, Salon Events", notes: "Evento corporativo" },
];

export const initialRecetas: DishIngredient[] = [
  // Ceviche Mixto (dish 1) → usa camarón/pulpo
  { id: "r1", dishId: "1", insumoId: "i1", cantidad: 0.3 },
  // Tostada de Mariscos (dish 2) → usa pulpo
  { id: "r2", dishId: "2", insumoId: "i1", cantidad: 0.2 },
  // Cóctel de Camarón (dish 3)
  { id: "r3", dishId: "3", insumoId: "i1", cantidad: 0.25 },
  // Filete al Mojo de Ajo (dish 4) → usa aceite
  { id: "r4", dishId: "4", insumoId: "i2", cantidad: 0.05 },
  // Caldo de Mariscos (dish 5) → usa pulpo + pimentón
  { id: "r5", dishId: "5", insumoId: "i1", cantidad: 0.2 },
  { id: "r6", dishId: "5", insumoId: "i3", cantidad: 0.02 },
  // Michelada (dish 6) → no usa insumos del inventario (es cerveza embotellada)
  // Agua de Horchata (dish 7) → no usa insumos del inventario
  // Pay de Limón (dish 8) → no usa insumos del inventario
];
