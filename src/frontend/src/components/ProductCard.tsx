import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
  imageOverride?: string; // used for static catalog products that have a pre-assigned image
}

// Category accent colors for pill labels & fallback background
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

export default function ProductCard({
  product,
  onViewDetails,
  imageOverride,
}: ProductCardProps) {
  const addToCart = useAddToCart();
  const imgSrc =
    imageOverride ?? getProductImage(product.name, product.category);
  const config = CATEGORY_CONFIG[product.category] ?? {
    dot: "bg-muted-foreground",
    fallbackBg: "bg-secondary",
    initial: product.category[0] ?? "?",
  };
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart.mutate(
      { productId: product.id, quantity: BigInt(1) },
      {
        onSuccess: () => toast.success(`${product.name} added to cart`),
        onError: () => toast.error("Failed to add to cart"),
      },
    );
  };

  return (
    <article
      className="group bg-card border border-border/70 rounded-2xl overflow-hidden shadow-card product-card-hover flex flex-col"
      data-ocid="store.product.card"
    >
      {/* Clickable image + info area */}
      <button
        type="button"
        onClick={onViewDetails}
        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex flex-col"
        data-ocid="store.product.view_details.button"
      >
        {/* Product Image */}
        <div className="relative bg-secondary/50 h-56 w-full flex items-center justify-center overflow-hidden">
          {imgError ? (
            // Fallback: colored placeholder with category initial
            <div
              className={`w-full h-full flex flex-col items-center justify-center gap-2 ${config.fallbackBg}`}
            >
              <span className="text-5xl font-display font-bold text-foreground/20">
                {config.initial}
              </span>
              <span className="text-xs font-body text-muted-foreground">
                {product.category}
              </span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.06]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/30 to-transparent pointer-events-none" />

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/75 flex items-center justify-center backdrop-blur-[1px]">
              <span className="px-3 py-1 rounded-full bg-destructive/10 border border-destructive/25 text-destructive text-[11px] font-body font-semibold tracking-wide">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 pt-4 pb-2 flex flex-col gap-1.5">
          {/* Category label */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`}
            />
            <span className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-widest">
              {product.category}
            </span>
            {product.inStock ? (
              <span className="ml-auto text-[10px] font-body font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                In stock
              </span>
            ) : (
              <span className="ml-auto text-[10px] font-body font-medium text-destructive">
                Out of stock
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-[12.5px] font-body line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </button>

      {/* Price & Action */}
      <div className="px-4 pb-4 pt-3 mt-auto border-t border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
              Price
            </p>
            <span className="font-display font-bold text-xl text-primary leading-none">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.inStock || addToCart.isPending}
          data-ocid="store.product.add_to_cart.button"
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-[13px] font-body font-semibold h-9 transition-all duration-150"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          {addToCart.isPending ? "Adding…" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
