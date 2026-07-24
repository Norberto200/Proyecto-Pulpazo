import { lazy, Suspense } from "react";
import { createHashRouter } from "react-router";
import Login from "./components/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const MapaMesas = lazy(() => import("./components/MapaMesas"));
const MasInformacion = lazy(() => import("./components/MasInformacion"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const ClienteMenu = lazy(() => import("./components/ClienteMenu"));
const Carrito = lazy(() => import("./components/Carrito"));
const HistorialPedidos = lazy(() => import("./components/HistorialPedidos"));
const Inventario = lazy(() => import("./components/Inventario"));
const DashboardEjecutivo = lazy(() => import("./components/DashboardEjecutivo"));
const CorteCaja = lazy(() => import("./components/CorteCaja"));
const Promotores = lazy(() => import("./components/Promotores"));
const Clientes = lazy(() => import("./components/Clientes"));
const Repartidores = lazy(() => import("./components/Repartidores"));
const Cocina = lazy(() => import("./components/Cocina"));
const Reportes = lazy(() => import("./components/Reportes"));
const Descuentos = lazy(() => import("./components/Descuentos"));
const DividirCuenta = lazy(() => import("./components/DividirCuenta"));

function LazyWrapper() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export const router = createHashRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Suspense fallback={<LazyWrapper />}><MapaMesas /></Suspense>,
      },
      {
        path: "mapa-mesas",
        element: <Suspense fallback={<LazyWrapper />}><MapaMesas /></Suspense>,
      },
      {
        path: "admin",
        element: <Suspense fallback={<LazyWrapper />}><AdminPanel /></Suspense>,
      },
      {
        path: "dashboard-ejecutivo",
        element: <Suspense fallback={<LazyWrapper />}><DashboardEjecutivo /></Suspense>,
      },
      {
        path: "corte-caja",
        element: <Suspense fallback={<LazyWrapper />}><CorteCaja /></Suspense>,
      },
      {
        path: "promotores",
        element: <Suspense fallback={<LazyWrapper />}><Promotores /></Suspense>,
      },
      {
        path: "clientes",
        element: <Suspense fallback={<LazyWrapper />}><Clientes /></Suspense>,
      },
      {
        path: "repartidores",
        element: <Suspense fallback={<LazyWrapper />}><Repartidores /></Suspense>,
      },
      {
        path: "cocina",
        element: <Suspense fallback={<LazyWrapper />}><Cocina /></Suspense>,
      },
      {
        path: "reportes",
        element: <Suspense fallback={<LazyWrapper />}><Reportes /></Suspense>,
      },
      {
        path: "descuentos",
        element: <Suspense fallback={<LazyWrapper />}><Descuentos /></Suspense>,
      },
      {
        path: "dividir-cuenta",
        element: <Suspense fallback={<LazyWrapper />}><DividirCuenta /></Suspense>,
      },
      {
        path: "inventario",
        element: <Suspense fallback={<LazyWrapper />}><Inventario /></Suspense>,
      },
      {
        path: "cliente-menu",
        element: <Suspense fallback={<LazyWrapper />}><ClienteMenu /></Suspense>,
      },
      {
        path: "carrito",
        element: <Suspense fallback={<LazyWrapper />}><Carrito /></Suspense>,
      },
      {
        path: "historial",
        element: <Suspense fallback={<LazyWrapper />}><HistorialPedidos /></Suspense>,
      },
      {
        path: "mas-informacion",
        element: <Suspense fallback={<LazyWrapper />}><MasInformacion /></Suspense>,
      },
    ],
  },
  {
    path: "*",
    element: <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Página no encontrada</p></div>,
  },
]);
