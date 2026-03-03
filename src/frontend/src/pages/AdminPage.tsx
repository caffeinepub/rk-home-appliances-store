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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
  useAllProducts,
  useDeleteProduct,
  useIsAdmin,
} from "../hooks/useQueries";

interface AdminPageProps {
  onBackToStore: () => void;
}

type FormMode = { type: "add" } | { type: "edit"; product: Product };

export default function AdminPage({ onBackToStore }: AdminPageProps) {
  const [formState, setFormState] = useState<FormMode | null>(null);
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const {
    data: products,
    isLoading: productsLoading,
    refetch,
  } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

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
                size="sm"
                onClick={() => setFormState({ type: "add" })}
                data-ocid="admin.add_product.primary_button"
                className="gap-2 bg-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Products",
              value: products?.length ?? 0,
              icon: Package,
            },
            {
              label: "In Stock",
              value: products?.filter((p) => p.inStock).length ?? 0,
              icon: Package,
            },
            {
              label: "Out of Stock",
              value: products?.filter((p) => !p.inStock).length ?? 0,
              icon: Package,
            },
            {
              label: "Categories",
              value: [...new Set(products?.map((p) => p.category) ?? [])]
                .length,
              icon: Package,
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
                {productsLoading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  stat.value
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Products Table */}
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
                                  <strong>"{product.name}"</strong>? This action
                                  cannot be undone.
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
