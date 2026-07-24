import type { UserRole } from "./context/types";

// ── Which sidebar paths each role can access ──
export const allowedPaths: Record<UserRole, string[]> = {
  administrador: [
    "/dashboard/dashboard-ejecutivo",
    "/dashboard/corte-caja",
    "/dashboard/clientes",
    "/dashboard/promotores",
    "/dashboard/repartidores",
    "/dashboard/cocina",
    "/dashboard/reportes",
    "/dashboard/descuentos",
    "/dashboard/dividir-cuenta",
    "/dashboard/admin",
    "/dashboard/mapa-mesas",
    "/dashboard/inventario",
    "/dashboard/cliente-menu",
    "/dashboard/carrito",
    "/dashboard/historial",
    "/dashboard/mas-informacion",
  ],
  cajera: [
    "/dashboard/corte-caja",
    "/dashboard/clientes",
    "/dashboard/reportes",
    "/dashboard/descuentos",
    "/dashboard/dividir-cuenta",
    "/dashboard/historial",
    "/dashboard/mapa-mesas",
    "/dashboard/carrito",
  ],
  mesero: [
    "/dashboard/mapa-mesas",
    "/dashboard/cliente-menu",
    "/dashboard/carrito",
    "/dashboard/historial",
    "/dashboard/mas-informacion",
  ],
  cocina: [
    "/dashboard/cocina",
    "/dashboard/historial",
  ],
};

// ── Check if a role can access a path ──
export function canAccess(role: UserRole, path: string): boolean {
  return allowedPaths[role]?.includes(path) ?? false;
}

// ── Friendly role labels (Spanish) ──
export const roleLabels: Record<UserRole, string> = {
  administrador: "Administrador",
  cajera: "Cajera",
  mesero: "Mesero",
  cocina: "Cocina",
};

// ── Role descriptions ──
export const roleDescriptions: Record<UserRole, string> = {
  administrador: "Acceso total al sistema",
  cajera: "Corte de caja, clientes, reportes, cobros",
  mesero: "Toma de pedidos, mapa de mesas",
  cocina: "Vista de cocina, pedidos en preparación",
};
