import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddProduct, useUpdateProduct } from "../hooks/useQueries";

const CATEGORIES = [
  "Refrigerators",
  "Air Conditioners",
  "Fans",
  "Kitchen Appliances",
  "LED TVs",
];

type FormMode = { type: "add" } | { type: "edit"; product: Product };

interface ProductFormModalProps {
  mode: FormMode;
  onClose: () => void;
}

export default function ProductFormModal({
  mode,
  onClose,
}: ProductFormModalProps) {
  const isEdit = mode.type === "edit";
  const existing = isEdit ? mode.product : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing?.price?.toString() ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [_inStock, _setInStock] = useState(existing?.inStock ?? true);

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  const isPending = addProduct.isPending || updateProduct.isPending;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required";
    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = "Valid price is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const priceNum = Number.parseFloat(price);

    if (isEdit && existing) {
      updateProduct.mutate(
        {
          id: existing.id,
          name: name.trim(),
          price: priceNum,
          description: description.trim(),
          category,
        },
        {
          onSuccess: () => {
            toast.success(`"${name}" updated successfully`);
            onClose();
          },
          onError: () => toast.error("Failed to update product"),
        },
      );
    } else {
      addProduct.mutate(
        {
          name: name.trim(),
          price: priceNum,
          description: description.trim(),
          category,
        },
        {
          onSuccess: () => {
            toast.success(`"${name}" added successfully`);
            onClose();
          },
          onError: () => toast.error("Failed to add product"),
        },
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-ocid="admin.product_form.modal"
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
        className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="admin.product_form.close_button"
            className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-name"
              className="font-body font-medium text-sm"
            >
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samsung 350L Frost Free Refrigerator"
              data-ocid="admin.product_form.name.input"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p
                data-ocid="admin.product_form.name_error"
                className="text-xs text-destructive font-body"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-price"
              className="font-body font-medium text-sm"
            >
              Price (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-price"
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 32999"
              data-ocid="admin.product_form.price.input"
              className={errors.price ? "border-destructive" : ""}
            />
            {errors.price && (
              <p
                data-ocid="admin.product_form.price_error"
                className="text-xs text-destructive font-body"
              >
                {errors.price}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-category"
              className="font-body font-medium text-sm"
            >
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="product-category"
                data-ocid="admin.product_form.category.select"
                className={errors.category ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-body">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p
                data-ocid="admin.product_form.category_error"
                className="text-xs text-destructive font-body"
              >
                {errors.category}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-description"
              className="font-body font-medium text-sm"
            >
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description..."
              rows={3}
              data-ocid="admin.product_form.description.textarea"
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && (
              <p
                data-ocid="admin.product_form.description_error"
                className="text-xs text-destructive font-body"
              >
                {errors.description}
              </p>
            )}
          </div>

          {/* In Stock Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
            <div>
              <Label className="font-body font-medium text-sm text-foreground">
                In Stock
              </Label>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                Mark if this product is currently available
              </p>
            </div>
            <Switch
              checked={_inStock}
              onCheckedChange={_setInStock}
              data-ocid="admin.product_form.instock.switch"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              data-ocid="admin.product_form.cancel_button"
              className="flex-1 font-body"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="admin.product_form.submit_button"
              className="flex-1 bg-primary text-primary-foreground font-body"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isEdit ? "Saving..." : "Adding..."}
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
