import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingCart, Tag, XCircle } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Refrigerators: "bg-blue-50 text-blue-700 border-blue-200",
  "Air Conditioners": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Fans: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Kitchen Appliances": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function ProductCard({
  product,
  onViewDetails,
}: ProductCardProps) {
  const addToCart = useAddToCart();
  const imgSrc = getProductImage(product.name, product.category);
  const categoryColor =
    CATEGORY_COLORS[product.category] ??
    "bg-secondary text-secondary-foreground border-border";

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
      className="group bg-card border border-border rounded-lg overflow-hidden shadow-card product-card-hover flex flex-col"
      data-ocid="store.product.card"
    >
      {/* Clickable image + info area */}
      <button
        type="button"
        onClick={onViewDetails}
        className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col"
      >
        {/* Product Image */}
        <div className="relative overflow-hidden bg-secondary/30 h-48 w-full">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="destructive" className="font-body font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Upper Content */}
        <div className="px-4 pt-4 flex flex-col gap-2">
          {/* Category Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 text-xs font-body font-medium px-2 py-0.5 rounded-full border ${categoryColor}`}
            >
              <Tag className="w-3 h-3" />
              {product.category}
            </span>
            {product.inStock ? (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-body">
                <CheckCircle className="w-3 h-3" />
                In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-destructive font-body">
                <XCircle className="w-3 h-3" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-display font-bold text-foreground text-base leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm font-body line-clamp-2">
            {product.description}
          </p>
        </div>
      </button>

      {/* Price & Action (outside button to avoid nesting) */}
      <div className="px-4 pb-4 pt-3 flex items-center justify-between mt-auto">
        <span className="font-display font-bold text-xl text-foreground">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.inStock || addToCart.isPending}
          data-ocid="store.product.add_to_cart.button"
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShoppingCart className="w-4 h-4" />
          {addToCart.isPending ? "Adding..." : "Add"}
        </Button>
      </div>
    </article>
  );
}
