import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  useAllProducts,
  useCart,
  useClearCart,
  useRemoveFromCart,
} from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cartItems, isLoading: cartLoading } = useCart();
  const { data: products } = useAllProducts();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();

  // Build enriched cart items
  const enrichedCart = (cartItems ?? []).map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const totalPrice = enrichedCart.reduce((acc, item) => {
    return acc + (item.product?.price ?? 0) * Number(item.quantity);
  }, 0);

  const handleRemove = (productId: bigint, productName: string) => {
    removeFromCart.mutate(productId, {
      onSuccess: () => toast.success(`${productName} removed from cart`),
      onError: () => toast.error("Failed to remove item"),
    });
  };

  const handleClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Cart cleared"),
      onError: () => toast.error("Failed to clear cart"),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" data-ocid="cart.sheet">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold text-foreground">
                  Your Cart
                </h2>
                {enrichedCart.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-body font-medium rounded-full px-2 py-0.5">
                    {enrichedCart.reduce(
                      (acc, item) => acc + Number(item.quantity),
                      0,
                    )}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                data-ocid="cart.sheet.close_button"
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Items */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                {cartLoading && (
                  <div data-ocid="cart.loading_state" className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-16 h-16 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!cartLoading && enrichedCart.length === 0 && (
                  <div
                    data-ocid="cart.empty_state"
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      Your cart is empty
                    </h3>
                    <p className="text-muted-foreground font-body text-sm">
                      Browse our products and add items to get started.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={onClose}
                      data-ocid="cart.continue_shopping.button"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                )}

                {!cartLoading &&
                  enrichedCart.map((item, index) => {
                    const product = item.product;
                    if (!product) return null;
                    const imgSrc = getProductImage(
                      product.name,
                      product.category,
                    );

                    return (
                      <div
                        key={item.productId.toString()}
                        className="flex gap-4 p-3 bg-background rounded-lg border border-border"
                        data-ocid={`cart.item.${index + 1}`}
                      >
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg bg-secondary/30 flex-shrink-0 overflow-hidden">
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-sm text-foreground line-clamp-1">
                            {product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground font-body mt-0.5">
                            {product.category}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-xs font-body text-muted-foreground bg-secondary rounded px-2 py-1">
                                <Minus className="w-3 h-3" />
                                {Number(item.quantity)}
                                <Plus className="w-3 h-3" />
                              </span>
                              <span className="font-display font-bold text-sm text-foreground">
                                ₹
                                {(
                                  product.price * Number(item.quantity)
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(item.productId, product.name)
                              }
                              data-ocid={`cart.item.delete_button.${index + 1}`}
                              className="text-destructive hover:text-destructive/80 transition-colors p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>

            {/* Footer */}
            {enrichedCart.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-body text-muted-foreground">
                    <span>
                      Subtotal (
                      {enrichedCart.reduce((a, i) => a + Number(i.quantity), 0)}{" "}
                      items)
                    </span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-display font-bold text-lg text-foreground">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    data-ocid="cart.checkout.primary_button"
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                    size="sm"
                    onClick={handleClearCart}
                    disabled={clearCart.isPending}
                    data-ocid="cart.clear.button"
                  >
                    <Trash2 className="w-4 h-4" />
                    {clearCart.isPending ? "Clearing..." : "Clear Cart"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
