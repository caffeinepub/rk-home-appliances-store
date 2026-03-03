import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, ShoppingCart, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const CATEGORY_CONFIG: Record<
  string,
  { dot: string; fallbackBg: string; initial: string }
> = {
  Refrigerators: {
    dot: "bg-blue-500",
    fallbackBg: "bg-blue-50",
    initial: "R",
  },
  "Air Conditioners": {
    dot: "bg-cyan-500",
    fallbackBg: "bg-cyan-50",
    initial: "A",
  },
  Fans: {
    dot: "bg-emerald-500",
    fallbackBg: "bg-emerald-50",
    initial: "F",
  },
  "Kitchen Appliances": {
    dot: "bg-amber-500",
    fallbackBg: "bg-amber-50",
    initial: "K",
  },
};

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const addToCart = useAddToCart();
  const imgSrc = getProductImage(product.name, product.category);
  const config = CATEGORY_CONFIG[product.category] ?? {
    dot: "bg-muted-foreground",
    fallbackBg: "bg-secondary",
    initial: product.category[0] ?? "?",
  };
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(1) },
      {
        onSuccess: () => {
          toast.success(`${product.name} added to cart`);
          onClose();
        },
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="product.modal"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-md overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          data-ocid="product.modal.close_button"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-secondary transition-colors shadow-xs"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>

        {/* Product Image */}
        <div className="relative bg-secondary/40 h-64 flex items-center justify-center overflow-hidden">
          {imgError ? (
            <div
              className={`w-full h-full flex flex-col items-center justify-center gap-2 ${config.fallbackBg}`}
            >
              <span className="text-6xl font-display font-bold text-foreground/20">
                {config.initial}
              </span>
              <span className="text-sm font-body text-muted-foreground">
                {product.category}
              </span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform duration-300 hover:scale-[1.03]"
              onError={() => setImgError(true)}
            />
          )}
          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card/40 to-transparent pointer-events-none" />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/75 flex items-center justify-center backdrop-blur-[1px]">
              <span className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/25 text-destructive text-xs font-body font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category & Stock row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`}
              />
              <span className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-widest">
                {product.category}
              </span>
            </div>
            {product.inStock ? (
              <span className="text-[11px] font-body font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ✓ In Stock
              </span>
            ) : (
              <span className="text-[11px] font-body font-medium text-destructive">
                Out of Stock
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="font-display text-[22px] font-bold text-foreground mb-1.5 leading-snug">
            {product.name}
          </h2>

          {/* SKU */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-body mb-4">
            <Package className="w-3 h-3" />
            <span>SKU: RK-{product.id.toString().padStart(4, "0")}</span>
          </div>

          <Separator className="mb-4" />

          {/* Description */}
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-5">
            {product.description}
          </p>

          {/* Price & CTA */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="font-display text-3xl font-bold text-primary tracking-tight leading-none">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCart.isPending}
              data-ocid="product.modal.add_to_cart.button"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 font-body font-semibold flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              {addToCart.isPending ? "Adding…" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
