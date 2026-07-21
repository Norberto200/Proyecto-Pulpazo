import { createHashRouter } from "react-router";
import Login from "./components/Login";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import MapaMesas from "./components/MapaMesas";
import MasInformacion from "./components/MasInformacion";
import AdminPanel from "./components/AdminPanel";
import ClienteMenu from "./components/ClienteMenu";
import Carrito from "./components/Carrito";
import HistorialPedidos from "./components/HistorialPedidos";
import Inventario from "./components/Inventario";
import DashboardEjecutivo from "./components/DashboardEjecutivo";

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
        element: <MapaMesas />,
      },
      {
        path: "mapa-mesas",
        element: <MapaMesas />,
      },
      {
        path: "admin",
        element: <AdminPanel />,
      },
      {
        path: "dashboard-ejecutivo",
        element: <DashboardEjecutivo />,
      },
      {
        path: "inventario",
        element: <Inventario />,
      },
      {
        path: "cliente-menu",
        element: <ClienteMenu />,
      },
      {
        path: "carrito",
        element: <Carrito />,
      },
      {
        path: "historial",
        element: <HistorialPedidos />,
      },
      {
        path: "mas-informacion",
        element: <MasInformacion />,
      },
    ],
  },
]);
