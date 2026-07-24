import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutGrid, Info, LogOut,
  Menu, X, ShieldCheck,
  ShoppingCart, ClipboardList, BookOpen,
  TrendingUp, Package, Sun, Moon, ExternalLink, DollarSign, Truck, Users, Bike, ChefHat, BarChart3, Tag, SplitSquareHorizontal,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useApp } from "../context/AppContext";
import NotificacionesBell from "./NotificacionesBell";
import { canAccess, roleLabels } from "../permissions";
import logoImg from "@/imports/image.png";

const adminItems = [
  { path: "/dashboard/dashboard-ejecutivo", label: "Dashboard Ejecutivo", icon: TrendingUp },
  { path: "/dashboard/corte-caja", label: "Corte de Caja", icon: DollarSign },
  { path: "/dashboard/clientes", label: "Clientes", icon: Users },
  { path: "/dashboard/promotores", label: "Promotores", icon: Truck },
  { path: "/dashboard/repartidores", label: "Repartidores", icon: Bike },
  { path: "/dashboard/cocina", label: "Cocina", icon: ChefHat },
  { path: "/dashboard/reportes", label: "Reportes", icon: BarChart3 },
  { path: "/dashboard/descuentos", label: "Descuentos", icon: Tag },
  { path: "/dashboard/dividir-cuenta", label: "Dividir Cuenta", icon: SplitSquareHorizontal },
  { path: "/dashboard/admin", label: "Panel Admin", icon: ShieldCheck },
  { path: "/dashboard/mapa-mesas", label: "Mapa de Mesas", icon: LayoutGrid },
  { path: "/dashboard/inventario", label: "Inventario", icon: Package },
  { path: "/dashboard/mas-informacion", label: "Más Información", icon: Info },
];

const clientItems = [
  { path: "/dashboard/cliente-menu", label: "Tomar Pedido", icon: BookOpen },
  { path: "/dashboard/carrito", label: "Pedido Actual", icon: ShoppingCart, badge: true },
  { path: "/dashboard/historial", label: "Historial Pedidos", icon: ClipboardList },
];

function NavItem({ path, label, icon: Icon, badge, active, sidebarOpen, cartCount, onClick }: {
  path: string; label: string; icon: React.ElementType; badge?: boolean;
  active: boolean; sidebarOpen: boolean; cartCount?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={!sidebarOpen ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all relative group ${
        active ? "text-primary bg-primary/8 font-medium" : "text-gray-400 hover:text-primary hover:bg-primary/5"
      } ${!sidebarOpen ? "justify-center" : ""}`}
    >
      {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-r" />}
      <div className="relative flex-shrink-0">
        <Icon className="w-4 h-4" strokeWidth={1.5} />
        {badge && cartCount != null && cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-black rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </div>
      {sidebarOpen && <span className="text-xs tracking-wide whitespace-nowrap">{label}</span>}
    </button>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, userRole, userName, logout, theme, setTheme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const filteredAdminItems = adminItems.filter(item => canAccess(userRole, item.path));
  const filteredClientItems = clientItems.filter(item => canAccess(userRole, item.path));

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="bg-card border-r border-border flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: sidebarOpen ? "220px" : "56px" }}
      >
        {/* Logo */}
        <div className="flex justify-center pt-5 pb-2">
          <div
            className="rounded-full overflow-hidden border-2 border-primary/60 flex-shrink-0 transition-all duration-300"
            style={{
              width: sidebarOpen ? "64px" : "38px",
              height: sidebarOpen ? "64px" : "38px",
              boxShadow: "0 0 14px rgba(212,175,55,0.35)",
            }}
          >
            <ImageWithFallback src={logoImg} alt="El Pulpazo logo" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Hamburger */}
        <div className={`flex ${sidebarOpen ? "justify-start px-4" : "justify-center"} pb-4`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-primary hover:text-[#F4D03F] transition-colors p-1"
          >
            {sidebarOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* Admin section */}
          <div>
            {sidebarOpen && (
              <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase px-3 mb-2 font-semibold">Administración</p>
            )}
            {!sidebarOpen && <div className="border-t border-border my-1 mx-2" />}
            {filteredAdminItems.map((item) => (
              <NavItem key={item.path} {...item} active={isActive(item.path)} sidebarOpen={sidebarOpen} onClick={() => navigate(item.path)} />
            ))}
          </div>

          {/* Client section */}
          <div>
            {sidebarOpen && (
              <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase px-3 mb-2 font-semibold">Punto de Venta</p>
            )}
            {!sidebarOpen && <div className="border-t border-border my-1 mx-2" />}
            {filteredClientItems.map((item) => (
              <NavItem key={item.path} {...item} active={isActive(item.path)} sidebarOpen={sidebarOpen} cartCount={item.badge ? cartCount : undefined} onClick={() => navigate(item.path)} />
            ))}
          </div>

          {/* Platforms section */}
          <div>
            {sidebarOpen && (
              <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase px-3 mb-2 font-semibold">Plataformas</p>
            )}
            {!sidebarOpen && <div className="border-t border-border my-1 mx-2" />}
            <a
              href="https://www.ubereats.com"
              target="_blank"
              rel="noopener noreferrer"
              title={!sidebarOpen ? "Uber Eats" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/5 ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
              </svg>
              {sidebarOpen && <span className="text-xs tracking-wide whitespace-nowrap">Uber Eats</span>}
              {sidebarOpen && <ExternalLink className="w-3 h-3 ml-auto text-gray-600" />}
            </a>
            <a
              href="https://www.rappi.com"
              target="_blank"
              rel="noopener noreferrer"
              title={!sidebarOpen ? "Rappi" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all text-gray-400 hover:text-orange-400 hover:bg-orange-400/5 ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
              </svg>
              {sidebarOpen && <span className="text-xs tracking-wide whitespace-nowrap">Rappi</span>}
              {sidebarOpen && <ExternalLink className="w-3 h-3 ml-auto text-gray-600" />}
            </a>
            <a
              href="https://www.didi-food.com"
              target="_blank"
              rel="noopener noreferrer"
              title={!sidebarOpen ? "Didi Food" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all text-gray-400 hover:text-red-400 hover:bg-red-400/5 ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/>
              </svg>
              {sidebarOpen && <span className="text-xs tracking-wide whitespace-nowrap">Didi Food</span>}
              {sidebarOpen && <ExternalLink className="w-3 h-3 ml-auto text-gray-600" />}
            </a>
          </div>
        </div>

        {/* Logout */}
        <div className="p-2 mb-2">
          <button
            onClick={async () => { await logout(); navigate("/"); }}
            title={!sidebarOpen ? "Cerrar Sesión" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-primary rounded-lg transition-colors ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            {sidebarOpen && <span className="text-xs tracking-wide">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between transition-colors duration-300">
          {/* Left: Role badge & Theme Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 bg-background border border-border rounded-lg">
              <span className="text-[10px] tracking-widest text-gray-500 uppercase font-semibold">Rol:</span>
              <span className="text-xs text-primary font-semibold capitalize">{roleLabels[userRole] || userRole}</span>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground hover:text-primary transition-all cursor-pointer"
              title={theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-[#b3922e]" />}
            </button>
          </div>

          {/* Right: Cart shortcut & User */}
          <div className="flex items-center gap-5">
            <NotificacionesBell />
            <button
              onClick={() => navigate("/dashboard/carrito")}
              className="relative text-primary hover:text-[#F4D03F] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-black rounded-full text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#F4D03F] flex items-center justify-center">
                <span className="text-black text-xs font-semibold uppercase">
                  {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <span className="text-xs text-foreground font-semibold hidden sm:block">{userName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
