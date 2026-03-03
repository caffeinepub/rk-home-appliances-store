import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  DatabaseZap,
  Loader2,
  LogIn,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import ProductFormModal from "../components/ProductFormModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllOrders,
  useAllProducts,
  useDeleteProduct,
  useIsAdmin,
  useResetAndReSeed,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

interface AdminPageProps {
  onBackToStore: () => void;
}

type FormMode = { type: "add" } | { type: "edit"; product: Product };

const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const ORDER_STATUS_CONFIG: Record<
  string,
  { className: string; dotClass: string }
> = {
  Pending: {
    className: "text-amber-700 bg-amber-50 border-amber-200",
    dotClass: "bg-amber-500",
  },
  Confirmed: {
    className: "text-blue-700 bg-blue-50 border-blue-200",
    dotClass: "bg-blue-500",
  },
  Shipped: {
    className: "text-purple-700 bg-purple-50 border-purple-200",
    dotClass: "bg-purple-500",
  },
  Delivered: {
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  Cancelled: {
    className: "text-red-700 bg-red-50 border-red-200",
    dotClass: "bg-red-500",
  },
};

function OrderStatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUS_CONFIG[status] ?? {
    className: "text-muted-foreground bg-secondary border-border",
    dotClass: "bg-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-body font-semibold border rounded-full px-2.5 py-1 ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {status}
    </span>
  );
}

function formatOrderDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPage({ onBackToStore }: AdminPageProps) {
  const [formState, setFormState] = useState<FormMode | null>(null);
  const [activeTab, setActiveTab] = useState("products");
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    data: products,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useAllProducts();
  const {
    data: orders,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useAllOrders();
  const deleteProduct = useDeleteProduct();
  const updateOrderStatus = useUpdateOrderStatus();
  const resetAndReSeed = useResetAndReSeed();
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const refetch = activeTab === "orders" ? refetchOrders : refetchProducts;

  // Re-check admin on identity change
  useEffect(() => {
    if (identity) {
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    }
  }, [identity, queryClient]);

  const handleDelete = (product: Product) => {
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.success(`"${product.name}" deleted`),
      onError: () => toast.error("Failed to delete product"),
    });
  };

  const handleUpdateOrderStatus = (orderId: bigint, status: string) => {
    updateOrderStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => toast.success(`Order status updated to ${status}`),
        onError: () => toast.error("Failed to update order status"),
      },
    );
  };

  // Loading check
  if (adminLoading) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access Denied
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-background flex items-center justify-center p-4"
        data-ocid="admin.access_denied.section"
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-6">
            You need admin privileges to access this panel. Please log in with
            an authorized account.
          </p>
          <div className="space-y-3">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="admin.login.primary_button"
              className="w-full gap-2 bg-primary text-primary-foreground"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Logging in..." : "Log In"}
            </Button>
            <Button
              variant="ghost"
              onClick={onBackToStore}
              data-ocid="admin.back_to_store.button"
              className="w-full gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToStore}
                data-ocid="admin.back_to_store.button"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-base font-bold text-foreground leading-none">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-muted-foreground font-body">
                    RK Home Appliances
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                data-ocid="admin.refresh.button"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={resetAndReSeed.isPending}
                data-ocid="admin.reseed_products.button"
                onClick={() => {
                  resetAndReSeed.mutate(undefined, {
                    onSuccess: () =>
                      toast.success(
                        "Products re-seeded successfully! New LED TVs and all categories are now loaded.",
                      ),
                    onError: () =>
                      toast.error(
                        "Failed to re-seed products. Please try again.",
                      ),
                  });
                }}
                className="gap-2 text-amber-700 border-amber-300 hover:bg-amber-50"
              >
                {resetAndReSeed.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <DatabaseZap className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {resetAndReSeed.isPending
                    ? "Re-seeding..."
                    : "Re-seed Products"}
                </span>
              </Button>
              {activeTab === "products" && (
                <Button
                  size="sm"
                  onClick={() => setFormState({ type: "add" })}
                  data-ocid="admin.add_product.primary_button"
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Product</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Products", value: products?.length ?? 0 },
            {
              label: "In Stock",
              value: products?.filter((p) => p.inStock).length ?? 0,
            },
            { label: "Total Orders", value: orders?.length ?? 0 },
            {
              label: "Pending Orders",
              value: orders?.filter((o) => o.status === "Pending").length ?? 0,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="text-xs text-muted-foreground font-body mb-1">
                {stat.label}
              </p>
              <p className="font-display text-2xl font-bold text-foreground">
                {productsLoading || ordersLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  stat.value
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          data-ocid="admin.tabs"
        >
          <TabsList className="mb-6 gap-1" data-ocid="admin.tabs.list">
            <TabsTrigger
              value="products"
              data-ocid="admin.products.tab"
              className="gap-2"
            >
              <Package className="w-4 h-4" />
              Products
              {products && (
                <span className="ml-1 text-xs font-body text-muted-foreground">
                  ({products.length})
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              data-ocid="admin.orders.tab"
              className="gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Orders
              {orders && (
                <span className="ml-1 text-xs font-body text-muted-foreground">
                  ({orders.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">
                  Products
                </h2>
                <Badge variant="secondary" className="font-body">
                  {products?.length ?? 0} total
                </Badge>
              </div>

              {productsLoading && (
                <div
                  data-ocid="admin.products.loading_state"
                  className="p-6 space-y-3"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}

              {!productsLoading && products?.length === 0 && (
                <div
                  data-ocid="admin.products.empty_state"
                  className="p-12 text-center"
                >
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-display font-semibold text-foreground">
                    No products yet
                  </p>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    Add your first product to get started.
                  </p>
                  <Button
                    className="mt-4 gap-2"
                    onClick={() => setFormState({ type: "add" })}
                    data-ocid="admin.add_first_product.button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              )}

              {!productsLoading && products && products.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-display font-semibold text-foreground">
                          Name
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Category
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Price
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Stock
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => (
                        <TableRow
                          key={product.id.toString()}
                          className="hover:bg-muted/20 transition-colors"
                          data-ocid={`admin.products.row.${index + 1}`}
                        >
                          <TableCell>
                            <div>
                              <p className="font-body font-medium text-foreground">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-[200px]">
                                {product.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-body text-xs whitespace-nowrap"
                            >
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-display font-semibold text-foreground">
                            ₹{product.price.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            {product.inStock ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-body font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Out of Stock
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setFormState({ type: "edit", product })
                                }
                                data-ocid={`admin.products.edit_button.${index + 1}`}
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    data-ocid={`admin.products.delete_button.${index + 1}`}
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent data-ocid="admin.delete.dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-display">
                                      Delete Product
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="font-body">
                                      Are you sure you want to delete{" "}
                                      <strong>"{product.name}"</strong>? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      data-ocid="admin.delete.cancel_button"
                                      className="font-body"
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(product)}
                                      data-ocid="admin.delete.confirm_button"
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                                    >
                                      {deleteProduct.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                      ) : null}
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">
                  All Orders
                </h2>
                <Badge variant="secondary" className="font-body">
                  {orders?.length ?? 0} total
                </Badge>
              </div>

              {ordersLoading && (
                <div
                  data-ocid="admin.orders.loading_state"
                  className="p-6 space-y-3"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              )}

              {!ordersLoading && (!orders || orders.length === 0) && (
                <div
                  data-ocid="admin.orders.empty_state"
                  className="p-12 text-center"
                >
                  <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-display font-semibold text-foreground">
                    No orders yet
                  </p>
                  <p className="text-muted-foreground text-sm font-body mt-1">
                    Orders will appear here once customers place them.
                  </p>
                </div>
              )}

              {!ordersLoading && orders && orders.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="font-display font-semibold text-foreground">
                          Order ID
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Customer
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground hidden md:table-cell">
                          Phone
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground hidden lg:table-cell">
                          Address
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground hidden sm:table-cell">
                          Payment
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground hidden sm:table-cell">
                          Items
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Total
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground">
                          Status
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="font-display font-semibold text-foreground text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...orders]
                        .sort(
                          (a, b) => Number(b.createdAt) - Number(a.createdAt),
                        )
                        .map((order, index) => (
                          <TableRow
                            key={order.id.toString()}
                            className="hover:bg-muted/20 transition-colors"
                            data-ocid={`admin.orders.row.${index + 1}`}
                          >
                            <TableCell>
                              <span className="font-display font-semibold text-foreground text-sm">
                                #ORD-{order.id.toString().padStart(6, "0")}
                              </span>
                            </TableCell>
                            <TableCell>
                              <p className="font-body font-medium text-foreground text-sm">
                                {order.customerName}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <p className="text-sm font-body text-muted-foreground">
                                {order.phone}
                              </p>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <p className="text-xs font-body text-muted-foreground max-w-[150px] truncate">
                                {order.deliveryAddress}
                              </p>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge
                                variant="outline"
                                className="font-body text-xs whitespace-nowrap"
                              >
                                {order.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <span className="text-sm font-body text-foreground">
                                {order.items.length} item
                                {order.items.length !== 1 ? "s" : ""}
                              </span>
                            </TableCell>
                            <TableCell className="font-display font-semibold text-foreground">
                              ₹{order.totalAmount.toLocaleString("en-IN")}
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="text-xs font-body text-muted-foreground">
                                {formatOrderDate(order.createdAt)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    data-ocid={`admin.orders.status_dropdown.${index + 1}`}
                                    className="gap-1.5 font-body text-xs h-8"
                                    disabled={updateOrderStatus.isPending}
                                  >
                                    {updateOrderStatus.isPending ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : null}
                                    Update
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  data-ocid={`admin.orders.status_menu.${index + 1}`}
                                >
                                  {ORDER_STATUSES.map((status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() =>
                                        handleUpdateOrderStatus(
                                          order.id,
                                          status,
                                        )
                                      }
                                      data-ocid={`admin.orders.set_${status.toLowerCase()}.button`}
                                      className={`font-body text-sm cursor-pointer ${order.status === status ? "font-semibold" : ""}`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${ORDER_STATUS_CONFIG[status]?.dotClass ?? "bg-muted-foreground"}`}
                                      />
                                      {status}
                                      {order.status === status && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          current
                                        </span>
                                      )}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Product Form Modal */}
      {formState && (
        <ProductFormModal mode={formState} onClose={() => setFormState(null)} />
      )}
    </div>
  );
}
