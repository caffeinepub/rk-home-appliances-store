// Map product names/categories to generated images
const productImageMap: Record<string, string> = {
  // Refrigerators
  refrigerator: "/assets/generated/product-refrigerator-1.dim_400x400.jpg",
  fridge: "/assets/generated/product-refrigerator-1.dim_400x400.jpg",
  "double door": "/assets/generated/product-refrigerator-2.dim_400x400.jpg",
  "single door": "/assets/generated/product-refrigerator-1.dim_400x400.jpg",
  "french door": "/assets/generated/product-refrigerator-1.dim_400x400.jpg",
  "side by side": "/assets/generated/product-refrigerator-2.dim_400x400.jpg",
  "mini fridge": "/assets/generated/product-refrigerator-2.dim_400x400.jpg",
  // ACs
  "air conditioner": "/assets/generated/product-ac-1.dim_400x400.jpg",
  "split ac": "/assets/generated/product-ac-1.dim_400x400.jpg",
  "window ac": "/assets/generated/product-ac-1.dim_400x400.jpg",
  "portable ac": "/assets/generated/product-ac-1.dim_400x400.jpg",
  "inverter ac": "/assets/generated/product-ac-1.dim_400x400.jpg",
  // Fans
  "tower fan": "/assets/generated/product-fan-1.dim_400x400.jpg",
  "ceiling fan": "/assets/generated/product-fan-1.dim_400x400.jpg",
  "table fan": "/assets/generated/product-fan-2.dim_400x400.jpg",
  "desk fan": "/assets/generated/product-fan-2.dim_400x400.jpg",
  "standing fan": "/assets/generated/product-fan-1.dim_400x400.jpg",
  "pedestal fan": "/assets/generated/product-fan-1.dim_400x400.jpg",
  "exhaust fan": "/assets/generated/product-fan-2.dim_400x400.jpg",
  // Kitchen
  microwave: "/assets/generated/product-kitchen-1.dim_400x400.jpg",
  blender: "/assets/generated/product-kitchen-2.dim_400x400.jpg",
  mixer: "/assets/generated/product-kitchen-2.dim_400x400.jpg",
  toaster: "/assets/generated/product-kitchen-1.dim_400x400.jpg",
  oven: "/assets/generated/product-kitchen-1.dim_400x400.jpg",
  juicer: "/assets/generated/product-kitchen-2.dim_400x400.jpg",
  "food processor": "/assets/generated/product-kitchen-2.dim_400x400.jpg",
  kettle: "/assets/generated/product-kitchen-1.dim_400x400.jpg",
  "rice cooker": "/assets/generated/product-kitchen-1.dim_400x400.jpg",
  induction: "/assets/generated/product-kitchen-1.dim_400x400.jpg",
};

const categoryDefaults: Record<string, string> = {
  Refrigerators: "/assets/generated/product-refrigerator-1.dim_400x400.jpg",
  "Air Conditioners": "/assets/generated/product-ac-1.dim_400x400.jpg",
  Fans: "/assets/generated/product-fan-1.dim_400x400.jpg",
  "Kitchen Appliances": "/assets/generated/product-kitchen-1.dim_400x400.jpg",
};

export function getProductImage(name: string, category: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, img] of Object.entries(productImageMap)) {
    if (lowerName.includes(key)) return img;
  }
  return (
    categoryDefaults[category] ||
    "/assets/generated/product-kitchen-1.dim_400x400.jpg"
  );
}
