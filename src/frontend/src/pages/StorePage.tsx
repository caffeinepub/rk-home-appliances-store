import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Settings, ShoppingCart, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Product } from "../backend.d";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import { useActor } from "../hooks/useActor";
import { useAllProducts } from "../hooks/useQueries";
import { useCart } from "../hooks/useQueries";
import { useSeedProducts } from "../hooks/useQueries";
import { useIsAdmin } from "../hooks/useQueries";

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Refrigerators", value: "Refrigerators" },
  { label: "Air Conditioners", value: "Air Conditioners" },
  { label: "Fans", value: "Fans" },
  { label: "Kitchen Appliances", value: "Kitchen Appliances" },
];

interface StorePageProps {
  onNavigateAdmin: () => void;
  onOpenCart: () => void;
}

export default function StorePage({
  onNavigateAdmin,
  onOpenCart,
}: StorePageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { actor, isFetching: actorFetching } = useActor();
  const {
    data: products,
    isLoading: productsLoading,
    isError,
  } = useAllProducts();
  const { data: cartItems } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const seedMutation = useSeedProducts();

  const cartCount =
    cartItems?.reduce((acc, item) => acc + Number(item.quantity), 0) ?? 0;

  const seedMutate = seedMutation.mutate;

  // Seed products once on first load
  useEffect(() => {
    if (!actor || actorFetching) return;
    const seeded = localStorage.getItem("rk_seeded_v2");
    if (!seeded) {
      seedMutate(undefined, {
        onSuccess: () => {
          localStorage.setItem("rk_seeded_v2", "true");
        },
      });
    }
  }, [actor, actorFetching, seedMutate]);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products?.filter((p) => p.category === selectedCategory);

  const isLoading = productsLoading || seedMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card shadow-nav border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-foreground leading-none tracking-tight">
                  RK Home
                </h1>
                <p className="text-xs text-muted-foreground font-body">
                  Appliances Store
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateAdmin}
                  data-ocid="nav.admin_panel.button"
                  className="gap-2 hidden sm:flex"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNavigateAdmin}
                  data-ocid="nav.admin_panel_mobile.button"
                  className="sm:hidden"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCart}
                data-ocid="nav.cart.button"
                className="gap-2 relative"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground border-0"
                    data-ocid="nav.cart_count.badge"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-primary">
        <img
          src="/assets/generated/hero-appliances.dim_1200x400.jpg"
          alt="RK Home Appliances"
          className="w-full h-48 md:h-64 object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-3 bg-accent text-accent-foreground border-0 font-body font-semibold">
                Quality Guaranteed
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground leading-tight mb-2">
                Premium Home
                <br />
                Appliances
              </h2>
              <p className="text-primary-foreground/70 font-body text-sm md:text-base max-w-md">
                Top brands, best prices, delivered to your door.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                data-ocid="store.category.tab"
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200
                  ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-foreground hover:bg-secondary"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
            {!isLoading && (
              <p className="text-muted-foreground text-sm font-body mt-0.5">
                {filteredProducts?.length ?? 0} products found
              </p>
            )}
          </div>
          {selectedCategory !== "All" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className="gap-1 text-muted-foreground"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div
            data-ocid="store.products.error_state"
            className="text-center py-16"
          >
            <p className="text-destructive font-body">
              Failed to load products. Please refresh the page.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            data-ocid="store.products.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
              <div
                key={sk}
                className="rounded-lg overflow-hidden border border-border bg-card"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-9 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredProducts?.length === 0 && (
          <div
            data-ocid="store.products.empty_state"
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No products found
            </h3>
            <p className="text-muted-foreground font-body text-sm">
              {selectedCategory !== "All"
                ? `No products in the ${selectedCategory} category yet.`
                : "No products available. Check back soon!"}
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading &&
          !isError &&
          filteredProducts &&
          filteredProducts.length > 0 && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.06 },
                },
              }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.35 }}
                  data-ocid={`store.products.item.${index + 1}`}
                >
                  <ProductCard
                    product={product}
                    onViewDetails={() => setSelectedProduct(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm font-body">
            © {new Date().getFullYear()}.{" "}
            <span className="font-medium text-foreground">
              RK Home Appliances
            </span>
            . Built with ❤️ using{" "}
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

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
