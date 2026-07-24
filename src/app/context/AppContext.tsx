import { createContext, useContext, ReactNode } from "react";
import type {
  Dish, CartItem, Order, Table, Insumo, UserRole, Cliente, Gasto, Abono, Promotor, Entrega,
  CorteRecord, CorteSummary, Repartidor, EntregaRepartidor, DishIngredient, Descuento, Notificacion,
} from "./types";
import { DishesProvider, useDishes } from "./DishesContext";
import { TablesProvider, useTables } from "./TablesContext";
import { CartProvider, useCart } from "./CartContext";
import { InventoryProvider, useInventory } from "./InventoryContext";
import { ClientsProvider, useClients } from "./ClientsContext";
import { FinanceProvider, useFinance } from "./FinanceContext";
import { SuppliersProvider, useSuppliers } from "./SuppliersContext";
import { RepartidoresProvider, useRepartidores } from "./RepartidoresContext";
import { RecipesProvider, useRecipes } from "./RecipesContext";
import { DiscountsProvider, useDiscounts } from "./DiscountsContext";
import { NotificationsProvider, useNotifications } from "./NotificationsContext";
import { AuthProvider, useAuth } from "./AuthContext";

// Re-export types for backward compatibility
export type { Dish, CartItem, Order, Table, Insumo, UserRole, Cliente, Gasto, Abono, Promotor, Entrega, CorteRecord, CorteSummary, Repartidor, EntregaRepartidor, DishIngredient, Descuento, Notificacion };
export type { DishCategory, TableStatus, TableShape, RepartidorVehiculo, RepartidorEstatus, EntregaRepartidorEstatus, DescuentoTipo, NotificacionTipo } from "./types";

interface AppContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (paymentMethod: string, table?: string) => void;
  placeOrderDetailed: (params: {
    paymentMethod: string;
    table?: string;
    clientName?: string;
    clientPhone?: string;
    clientAddress?: string;
    notes?: string;
    orderType: "local" | "llevar" | "domicilio" | "uber" | "rappi";
  }) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  currentTableId: string | null;
  setCurrentTableId: (id: string | null) => void;
  dishes: Dish[];
  setDishes: React.Dispatch<React.SetStateAction<Dish[]>>;
  addDish: (dish: Omit<Dish, "id" | "recommended">) => void;
  updateDish: (id: string, updatedFields: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  toggleAvailable: (id: string) => void;
  toggleRecommended: (id: string) => void;
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  addTable: (table: Omit<Table, "status">) => void;
  updateTable: (id: string, updatedFields: Partial<Table>) => void;
  removeTable: (id: string) => void;
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  addInsumo: (insumo: Omit<Insumo, "id">) => void;
  updateInsumo: (id: string, updatedFields: Partial<Insumo>) => void;
  removeInsumo: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userName: string;
  logout: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  clientes: Cliente[];
  addCliente: (cliente: Omit<Cliente, "id">) => void;
  updateCliente: (id: string, updatedFields: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
  gastos: Gasto[];
  addGasto: (gasto: Omit<Gasto, "id" | "date">) => void;
  abonos: Abono[];
  addAbono: (abono: Omit<Abono, "id" | "date">) => void;
  promotores: Promotor[];
  setPromotores: React.Dispatch<React.SetStateAction<Promotor[]>>;
  entregas: Entrega[];
  setEntregas: React.Dispatch<React.SetStateAction<Entrega[]>>;
  repartidores: Repartidor[];
  setRepartidores: React.Dispatch<React.SetStateAction<Repartidor[]>>;
  addRepartidor: (rp: Repartidor) => Promise<void>;
  updateRepartidor: (rp: Repartidor) => Promise<void>;
  deleteRepartidor: (id: string) => Promise<void>;
  entregasRepartidor: EntregaRepartidor[];
  setEntregasRepartidor: React.Dispatch<React.SetStateAction<EntregaRepartidor[]>>;
  addEntrega: (e: EntregaRepartidor) => Promise<void>;
  updateEntregaStatus: (id: string, estatus: EntregaRepartidor["estatus"]) => Promise<void>;
  cancelarEntrega: (id: string) => Promise<void>;
  recetas: DishIngredient[];
  addReceta: (receta: DishIngredient) => Promise<void>;
  updateReceta: (id: string, updatedFields: Partial<DishIngredient>) => Promise<void>;
  deleteReceta: (id: string) => Promise<void>;
  getRecetasByDish: (dishId: string) => DishIngredient[];
  deleteRecetasByDish: (dishId: string) => Promise<void>;
  descuentos: Descuento[];
  addDescuento: (d: Descuento) => Promise<void>;
  updateDescuento: (id: string, updatedFields: Partial<Descuento>) => Promise<void>;
  deleteDescuento: (id: string) => Promise<void>;
  findDescuentoByCode: (code: string) => Descuento | undefined;
  incrementarUso: (id: string) => Promise<void>;
  notificaciones: Notificacion[];
  addNotificacion: (n: Omit<Notificacion, "id" | "leida" | "fecha">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotificacion: (id: string) => void;
  clearAllNotificaciones: () => void;
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

function AppContextInner({ children }: { children: ReactNode }) {
  const dishesCtx = useDishes();
  const tablesCtx = useTables();
  const cartCtx = useCart();
  const inventoryCtx = useInventory();
  const clientsCtx = useClients();
  const financeCtx = useFinance();
  const suppliersCtx = useSuppliers();
  const repartidoresCtx = useRepartidores();
  const recipesCtx = useRecipes();
  const discountsCtx = useDiscounts();
  const notificationsCtx = useNotifications();
  const authCtx = useAuth();

  const value: AppContextType = {
    ...cartCtx,
    ...dishesCtx,
    ...tablesCtx,
    ...inventoryCtx,
    ...clientsCtx,
    ...financeCtx,
    ...suppliersCtx,
    ...repartidoresCtx,
    ...recipesCtx,
    ...discountsCtx,
    ...notificationsCtx,
    clearAllNotificaciones: notificationsCtx.clearAll,
    ...authCtx,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DishesProvider>
        <TablesProvider>
          <InventoryProvider>
            <ClientsProvider>
              <FinanceProvider>
        <SuppliersProvider>
          <RepartidoresProvider>
            <RecipesProvider>
              <DiscountsProvider>
                <NotificationsProvider>
                  <CartProviderWrapper>
                    <AppContextInner>{children}</AppContextInner>
                  </CartProviderWrapper>
                </NotificationsProvider>
              </DiscountsProvider>
            </RecipesProvider>
          </RepartidoresProvider>
        </SuppliersProvider>
              </FinanceProvider>
            </ClientsProvider>
          </InventoryProvider>
        </TablesProvider>
      </DishesProvider>
    </AuthProvider>
  );
}

// CartProvider needs access to TablesProvider and InventoryProvider, so we wrap it
function CartProviderWrapper({ children }: { children: ReactNode }) {
  const tablesCtx = useTables();
  const dishesCtx = useDishes();
  const inventoryCtx = useInventory();
  const recipesCtx = useRecipes();
  return (
    <CartProvider tablesContext={tablesCtx} dishesContext={dishesCtx} inventoryContext={inventoryCtx} recipesContext={recipesCtx}>
      {children}
    </CartProvider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
