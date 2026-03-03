import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LogIn,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Product } from "../backend.d";
import ProductCard from "../components/ProductCard";
import ProductDetailModal from "../components/ProductDetailModal";
import { STATIC_PRODUCTS } from "../data/staticProducts";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllProducts, useCart, useIsAdmin } from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

const CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Refrigerators", value: "Refrigerators" },
  { label: "Air Conditioners", value: "Air Conditioners" },
  { label: "Fans", value: "Fans" },
  { label: "Kitchen Appliances", value: "Kitchen Appliances" },
  { label: "LED TVs", value: "LED TVs" },
];

interface StorePageProps {
  onNavigateAdmin: () => void;
  onOpenCart: () => void;
  onMyOrders?: () => void;
}

export default function StorePage({
  onNavigateAdmin,
  onOpenCart,
  onMyOrders,
}: StorePageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: backendProducts, isLoading: productsLoading } =
    useAllProducts();
  const { data: cartItems } = useCart();
  const { data: isAdmin } = useIsAdmin();

  const cartCount =
    cartItems?.reduce((acc, item) => acc + Number(item.quantity), 0) ?? 0;

  // Convert static products to backend Product shape so both can be rendered the same way
  // Backend products (added by admin) take precedence; static products fill the rest
  const allProducts = useMemo(() => {
    const backendList = backendProducts ?? [];
    // Static products converted to backend Product shape (with BigInt id)
    const staticAsBE: (Product & { _staticImage?: string })[] =
      STATIC_PRODUCTS.map((sp) => ({
        id: BigInt(sp.id),
        name: sp.name,
        price: sp.price,
        description: sp.description,
        category: sp.category,
        inStock: sp.inStock,
        _staticImage: sp.image,
      }));
    // If backend has products, show backend products + static products not duplicated by name
    const backendNames = new Set(backendList.map((p) => p.name.toLowerCase()));
    const filteredStatic = staticAsBE.filter(
      (sp) => !backendNames.has(sp.name.toLowerCase()),
    );
    return [
      ...backendList.map((p) => ({
        ...p,
        _staticImage: undefined as string | undefined,
      })),
      ...filteredStatic,
    ];
  }, [backendProducts]);

  const filteredProducts =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const isLoading = productsLoading && backendProducts === undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header — clean white sticky nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-xs">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-base font-bold text-foreground leading-none tracking-tight">
                  RK Home
                </h1>
                <p className="text-[10px] text-muted-foreground font-body leading-tight mt-0.5 tracking-wide uppercase">
                  Appliances Store
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated && onMyOrders && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMyOrders}
                  data-ocid="nav.my_orders.button"
                  className="gap-2 hidden sm:flex text-muted-foreground hover:text-foreground"
                >
                  <Package className="w-4 h-4" />
                  My Orders
                </Button>
              )}
              {isAuthenticated && onMyOrders && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMyOrders}
                  data-ocid="nav.my_orders_mobile.button"
                  className="sm:hidden text-muted-foreground hover:text-foreground"
                >
                  <Package className="w-4 h-4" />
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateAdmin}
                  data-ocid="nav.admin_panel.button"
                  className="gap-2 hidden sm:flex text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4" />
                  Admin
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNavigateAdmin}
                  data-ocid="nav.admin_panel_mobile.button"
                  className="sm:hidden text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              {/* Login / Logout */}
              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="nav.login.button"
                  className="gap-2 text-sm font-body font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  data-ocid="nav.logout.button"
                  className="gap-2 text-muted-foreground hover:text-foreground hidden sm:flex"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              )}

              <button
                type="button"
                onClick={onOpenCart}
                data-ocid="nav.cart.button"
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-body font-medium text-foreground"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-body font-bold flex items-center justify-center"
                    data-ocid="nav.cart_count.badge"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — immersive split layout */}
      <section className="relative bg-card border-b border-border overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.40 0.18 278) 1px, transparent 1px), linear-gradient(90deg, oklch(0.40 0.18 278) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Indigo glow top-left */}
        <div className="absolute -top-32 -left-24 w-72 h-72 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-8 w-52 h-52 rounded-full bg-primary/6 blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-center gap-8 py-12 md:py-16">
            {/* Text side */}
            <motion.div
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="mb-5 text-[10px] font-body font-bold tracking-[0.15em] uppercase text-primary border-primary/30 bg-primary/5"
              >
                ✦ Quality Guaranteed
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.04] tracking-tight mb-5">
                Premium Home
                <br />
                <span className="text-primary">Appliances</span>
              </h2>
              <p className="text-muted-foreground font-body text-base max-w-[340px] mx-auto md:mx-0 leading-relaxed mb-7">
                Top brands, best prices. Refrigerators, ACs, fans, LED TVs &amp;
                kitchen essentials delivered to your door.
              </p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button
                  type="button"
                  onClick={() => {
                    document
                      .getElementById("product-grid-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-xs"
                  data-ocid="hero.shop_now.button"
                >
                  Shop Now →
                </button>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {[
                      { color: "bg-blue-400", label: "refrigerators" },
                      { color: "bg-cyan-400", label: "ac" },
                      { color: "bg-emerald-400", label: "fans" },
                      { color: "bg-amber-400", label: "kitchen" },
                      { color: "bg-violet-400", label: "tv" },
                    ].map((cat) => (
                      <span
                        key={cat.label}
                        className={`w-4 h-4 rounded-full ${cat.color} border-2 border-card`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-body text-muted-foreground">
                    30+ products, 5 categories
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Image side */}
            <motion.div
              className="flex-1 flex justify-center md:justify-end"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative w-full max-w-[420px]">
                {/* Decorative ring */}
                <div className="absolute inset-4 rounded-3xl border border-primary/10" />
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-secondary to-secondary/60 p-2">
                  <img
                    src="/assets/generated/hero-appliances-showcase.dim_900x600.png"
                    alt="Premium Home Appliances"
                    className="relative w-full h-auto object-contain rounded-2xl"
                    style={{ maxHeight: "300px" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10" id="product-grid-section">
        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                data-ocid="store.category.tab"
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-body font-semibold transition-all duration-200
                  ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5"
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
            <h2 className="font-display text-xl font-bold text-foreground">
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
            {!isLoading && (
              <p className="text-muted-foreground text-sm font-body mt-0.5">
                {filteredProducts?.length ?? 0} products
              </p>
            )}
          </div>
          {selectedCategory !== "All" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("All")}
              className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="store.view_all.button"
            >
              View all →
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            data-ocid="store.products.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((sk) => (
              <div
                key={sk}
                className="rounded-xl overflow-hidden border border-border bg-card"
              >
                <Skeleton className="h-52 w-full" />
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-3.5 w-1/3 rounded-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-9 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProducts?.length === 0 && (
          <div
            data-ocid="store.products.empty_state"
            className="text-center py-20"
          >
            <div className="w-14 h-14 rounded-xl border border-border bg-card flex items-center justify-center mx-auto mb-4 shadow-xs">
              <ShoppingCart className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
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
        {!isLoading && filteredProducts && filteredProducts.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.05 },
              },
            }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
                data-ocid={`store.products.item.${index + 1}`}
              >
                <ProductCard
                  product={product}
                  onViewDetails={() => setSelectedProduct(product)}
                  imageOverride={
                    (product as Product & { _staticImage?: string })
                      ._staticImage ??
                    getProductImage(product.name, product.category)
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card">
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
              className="text-primary hover:underline"
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
