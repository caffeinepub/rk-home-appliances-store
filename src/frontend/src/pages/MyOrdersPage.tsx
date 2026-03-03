import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Loader2,
  LogIn,
  Package,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMyOrders } from "../hooks/useQueries";

interface MyOrdersPageProps {
  onBackToStore: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  Pending: {
    label: "Pending",
    className: "text-amber-700 bg-amber-50 border-amber-200",
    dotClass: "bg-amber-500",
  },
  Confirmed: {
    label: "Confirmed",
    className: "text-blue-700 bg-blue-50 border-blue-200",
    dotClass: "bg-blue-500",
  },
  Shipped: {
    label: "Shipped",
    className: "text-purple-700 bg-purple-50 border-purple-200",
    dotClass: "bg-purple-500",
  },
  Delivered: {
    label: "Delivered",
    className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  Cancelled: {
    label: "Cancelled",
    className: "text-red-700 bg-red-50 border-red-200",
    dotClass: "bg-red-500",
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "text-muted-foreground bg-secondary border-border",
    dotClass: "bg-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-body font-semibold border rounded-full px-2.5 py-1 ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyOrdersPage({ onBackToStore }: MyOrdersPageProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: orders, isLoading, refetch } = useMyOrders();

  if (!isInitializing && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <button
                type="button"
                onClick={onBackToStore}
                data-ocid="myorders.back_to_store.button"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">
                  My Orders
                </span>
              </div>
            </div>
          </div>
        </header>
        <div
          className="flex-1 flex items-center justify-center p-4"
          data-ocid="myorders.login_required.section"
        >
          <motion.div
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Login Required
            </h2>
            <p className="text-muted-foreground font-body text-sm mb-6">
              Please log in to view your orders.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="myorders.login.primary_button"
              className="w-full gap-2 bg-primary text-primary-foreground"
              size="lg"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoggingIn ? "Logging in..." : "Log In"}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-nav">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onBackToStore}
                data-ocid="myorders.back_to_store.button"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-body"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </button>
              <div className="h-5 w-px bg-border" />
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-foreground">
                  My Orders
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              data-ocid="myorders.refresh.button"
              className="gap-2 text-sm"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Loading */}
        {isLoading && (
          <div data-ocid="myorders.loading_state" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!orders || orders.length === 0) && (
          <motion.div
            data-ocid="myorders.empty_state"
            className="text-center py-20"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-5 shadow-sm">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No orders yet
            </h3>
            <p className="text-muted-foreground font-body text-sm mb-6">
              You haven't placed any orders. Start shopping to see your orders
              here.
            </p>
            <Button
              onClick={onBackToStore}
              data-ocid="myorders.start_shopping.button"
              className="gap-2 bg-primary text-primary-foreground"
            >
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Button>
          </motion.div>
        )}

        {/* Orders List */}
        {!isLoading && orders && orders.length > 0 && (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            <p className="text-muted-foreground font-body text-sm mb-2">
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>

            {[...orders]
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order, index) => (
                <motion.div
                  key={order.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                  data-ocid={`myorders.item.${index + 1}`}
                >
                  {/* Order Header */}
                  <div className="p-5 border-b border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-display font-bold text-foreground">
                            #ORD-{order.id.toString().padStart(6, "0")}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground font-body flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-lg text-foreground">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-5 space-y-2">
                    {order.items.map((item, itemIdx) => (
                      <div
                        key={`${item.productId}-${itemIdx}`}
                        className="flex items-center justify-between gap-2 py-1"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                          <span className="font-body text-sm text-foreground truncate">
                            {item.productName}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-xs flex-shrink-0"
                          >
                            ×{Number(item.quantity)}
                          </Badge>
                        </div>
                        <span className="font-display font-semibold text-sm text-foreground flex-shrink-0">
                          ₹
                          {(
                            item.unitPrice * Number(item.quantity)
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-secondary/40 rounded-lg p-3">
                      <p className="text-xs font-body font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm font-body text-foreground">
                        {order.deliveryAddress}
                      </p>
                    </div>
                  </div>
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
    </div>
  );
}
