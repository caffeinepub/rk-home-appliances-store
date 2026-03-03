import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  ShoppingCart,
  Tag,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart } from "../hooks/useQueries";
import { getProductImage } from "../utils/productImages";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Refrigerators: "bg-blue-50 text-blue-700 border-blue-200",
  "Air Conditioners": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Fans: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Kitchen Appliances": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function ProductDetailModal({
  product,
  onClose,
}: ProductDetailModalProps) {
  const addToCart = useAddToCart();
  const imgSrc = getProductImage(product.name, product.category);
  const categoryColor =
    CATEGORY_COLORS[product.category] ??
    "bg-secondary text-secondary-foreground border-border";

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
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          data-ocid="product.modal.close_button"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Product Image */}
        <div className="relative bg-secondary/30 h-56">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-contain p-6"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge
                variant="destructive"
                className="font-body font-semibold text-sm"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category & Stock */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-body font-medium px-2.5 py-1 rounded-full border ${categoryColor}`}
            >
              <Tag className="w-3 h-3" />
              {product.category}
            </span>
            {product.inStock ? (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-body font-medium">
                <CheckCircle className="w-4 h-4" />
                In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-destructive font-body font-medium">
                <XCircle className="w-4 h-4" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-2 leading-tight">
            {product.name}
          </h2>

          <Separator className="my-3" />

          {/* Description */}
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Product ID */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body mb-4">
            <Package className="w-3 h-3" />
            <span>SKU: RK-{product.id.toString().padStart(4, "0")}</span>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-muted-foreground font-body">Price</p>
              <p className="font-display text-3xl font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!product.inStock || addToCart.isPending}
              data-ocid="product.modal.add_to_cart.button"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              <ShoppingCart className="w-5 h-5" />
              {addToCart.isPending ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
