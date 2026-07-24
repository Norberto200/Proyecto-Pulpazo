import type { TableStatus } from "../context/types";

export const statusColor: Record<TableStatus, string> = {
  libre: "#22c55e",
  ocupado: "#ef4444",
  reservado: "#f97316",
};

export const statusLabel: Record<TableStatus, string> = {
  libre: "Libre",
  ocupado: "Ocupado",
  reservado: "Reservado",
};

export const fmt = (n: number): string =>
  "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const STARTING_CASH = 1500.00;

export function calculateCashInDrawer(params: {
  efectivoSales: number;
  totalAbonos: number;
  totalGastos: number;
}): number {
  return STARTING_CASH + params.efectivoSales + params.totalAbonos - params.totalGastos;
}
