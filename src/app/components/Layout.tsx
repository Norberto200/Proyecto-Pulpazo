import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutGrid, Info, LogOut,
  Menu, X, ShieldCheck,
  ShoppingCart, ClipboardList, BookOpen,
  TrendingUp, Package, Sun, Moon,
} from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useApp } from "../context/AppContext";
import logoImg from "@/imports/image.png";

const adminItems = [
  { path: "/dashboard/dashboard-ejecutivo", label: "Dashboard Ejecutivo", icon: TrendingUp },
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

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, userRole, userName, logout, theme, setTheme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, label, icon: Icon, badge }: { path: string; label: string; icon: React.ElementType; badge?: boolean }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        title={!sidebarOpen ? label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg transition-all relative group ${
          active ? "text-[#D4AF37] bg-[#D4AF37]/8 font-medium" : "text-gray-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5"
        } ${!sidebarOpen ? "justify-center" : ""}`}
      >
        {active && <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-[#D4AF37] rounded-r" />}
        <div className="relative flex-shrink-0">
          <Icon className="w-4 h-4" strokeWidth={1.5} />
          {badge && cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4AF37] text-black rounded-full text-[9px] font-bold flex items-center justify-center">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </div>
        {sidebarOpen && <span className="text-xs tracking-wide whitespace-nowrap">{label}</span>}
      </button>
    );
  };

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
            className="rounded-full overflow-hidden border-2 border-[#D4AF37]/60 flex-shrink-0 transition-all duration-300"
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
            className="text-[#D4AF37] hover:text-[#F4D03F] transition-colors p-1"
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
            {adminItems.map((item) => <NavItem key={item.path} {...item} />)}
          </div>

          {/* Client section */}
          <div>
            {sidebarOpen && (
              <p className="text-[9px] tracking-[0.2em] text-gray-500 uppercase px-3 mb-2 font-semibold">Punto de Venta</p>
            )}
            {!sidebarOpen && <div className="border-t border-border my-1 mx-2" />}
            {clientItems.map((item) => <NavItem key={item.path} {...item} />)}
          </div>
        </div>

        {/* Logout */}
        <div className="p-2 mb-2">
          <button
            onClick={async () => { await logout(); navigate("/"); }}
            title={!sidebarOpen ? "Cerrar Sesión" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-[#D4AF37] rounded-lg transition-colors ${
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
              <span className="text-xs text-[#D4AF37] font-semibold capitalize">{userRole}</span>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground hover:text-[#D4AF37] transition-all cursor-pointer"
              title={theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#D4AF37]" /> : <Moon className="w-4 h-4 text-[#b3922e]" />}
            </button>
          </div>

          {/* Right: Cart shortcut & User */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate("/dashboard/carrito")}
              className="relative text-[#D4AF37] hover:text-[#F4D03F] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D4AF37] text-black rounded-full text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4D03F] flex items-center justify-center">
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
