// Map product names/categories to generated images
// Ordered so more-specific keys are checked first
const productImageMap: Record<string, string> = {
  // Refrigerators - specific first
  "double door": "/assets/generated/refrigerator-double-door.dim_600x600.jpg",
  "french door": "/assets/generated/refrigerator-french-door.dim_600x600.jpg",
  "side-by-side": "/assets/generated/refrigerator-side-by-side.dim_600x600.jpg",
  "side by side": "/assets/generated/refrigerator-side-by-side.dim_600x600.jpg",
  "single door": "/assets/generated/refrigerator-single-door.dim_600x600.jpg",
  "mini fridge": "/assets/generated/refrigerator-single-door.dim_600x600.jpg",
  convertible: "/assets/generated/refrigerator-double-door.dim_600x600.jpg",
  refrigerator: "/assets/generated/refrigerator-1.dim_400x400.jpg",
  fridge: "/assets/generated/refrigerator-1.dim_400x400.jpg",

  // ACs - specific first (check "split ac" and "window ac" before "inverter")
  "split ac": "/assets/generated/ac-split-unit.dim_600x600.jpg",
  "window ac": "/assets/generated/ac-window-unit.dim_600x600.jpg",
  "portable ac": "/assets/generated/ac-portable.dim_600x600.jpg",
  "inverter ac": "/assets/generated/ac-inverter.dim_600x600.jpg",
  "air conditioner": "/assets/generated/ac-split-unit.dim_600x600.jpg",
  // Match: "Daikin 1.5 Ton Inverter", "Voltas 2 Ton Window AC", "Carrier 1 Ton Split AC", "Godrej 1.5 Ton 5-star"
  inverter: "/assets/generated/ac-inverter.dim_600x600.jpg",
  window: "/assets/generated/ac-window-unit.dim_600x600.jpg",
  "split ": "/assets/generated/ac-split-unit.dim_600x600.jpg",
  portable: "/assets/generated/ac-portable.dim_600x600.jpg",
  "5-star": "/assets/generated/ac-split-unit.dim_600x600.jpg",
  " ton ": "/assets/generated/ac-split-unit.dim_600x600.jpg",

  // Fans - specific first
  "tower fan": "/assets/generated/fan-tower.dim_600x600.jpg",
  "ceiling fan": "/assets/generated/fan-ceiling.dim_600x600.jpg",
  "wall fan": "/assets/generated/fan-pedestal.dim_600x600.jpg",
  "table fan": "/assets/generated/fan-table.dim_600x600.jpg",
  "desk fan": "/assets/generated/fan-table.dim_600x600.jpg",
  "pedestal fan": "/assets/generated/fan-pedestal.dim_600x600.jpg",
  "standing fan": "/assets/generated/fan-pedestal.dim_600x600.jpg",
  "exhaust fan": "/assets/generated/fan-table.dim_600x600.jpg",
  // "Bajaj Airmax Wall Fan" -- matches "wall fan" above since we lowercase
  // "Orient 1200mm Ceiling Fan" -- matches "ceiling fan"
  // "Havells Standard Ceiling Fan" -- matches "ceiling fan"
  // "Usha Mist Air Desk Fan" -- matches "desk fan"
  fan: "/assets/generated/fan-1.dim_400x400.jpg",

  // LED TVs - specific first (size-based)
  '75"': "/assets/generated/led-tv-75inch.dim_600x600.jpg",
  '65"': "/assets/generated/led-tv-65inch.dim_600x600.jpg",
  '55"': "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  '43"': "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  '32"': "/assets/generated/led-tv-32inch.dim_600x600.jpg",
  qled: "/assets/generated/led-tv-65inch.dim_600x600.jpg",
  oled: "/assets/generated/led-tv-65inch.dim_600x600.jpg",
  "4k tv": "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  "smart tv": "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  "led tv": "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  television: "/assets/generated/led-tv-55inch.dim_600x600.jpg",
  "android tv": "/assets/generated/led-tv-32inch.dim_600x600.jpg",

  // Kitchen - specific first
  "air fryer": "/assets/generated/toaster-oven-1.dim_400x400.jpg",
  "coffee maker": "/assets/generated/kitchen-kettle.dim_600x600.jpg",
  "rice cooker": "/assets/generated/kitchen-rice-cooker.dim_600x600.jpg",
  "sandwich maker": "/assets/generated/kitchen-sandwich-maker.dim_600x600.jpg",
  "food processor": "/assets/generated/food-processor-1.dim_400x400.jpg",
  "hand blender": "/assets/generated/kitchen-blender.dim_600x600.jpg",
  "electric kettle": "/assets/generated/kitchen-kettle.dim_600x600.jpg",
  "mixer grinder": "/assets/generated/blender-1.dim_400x400.jpg",
  microwave: "/assets/generated/kitchen-microwave.dim_600x600.jpg",
  kettle: "/assets/generated/kitchen-kettle.dim_600x600.jpg",
  blender: "/assets/generated/kitchen-blender.dim_600x600.jpg",
  toaster: "/assets/generated/kitchen-toaster.dim_600x600.jpg",
  mixer: "/assets/generated/blender-1.dim_400x400.jpg",
  juicer: "/assets/generated/blender-1.dim_400x400.jpg",
  oven: "/assets/generated/kitchen-microwave.dim_600x600.jpg",
  induction: "/assets/generated/kitchen-microwave.dim_600x600.jpg",
};

const categoryDefaults: Record<string, string> = {
  Refrigerators: "/assets/generated/refrigerator-1.dim_400x400.jpg",
  "Air Conditioners": "/assets/generated/ac-1.dim_400x400.jpg",
  Fans: "/assets/generated/fan-1.dim_400x400.jpg",
  "Kitchen Appliances": "/assets/generated/kitchen-microwave.dim_600x600.jpg",
  "LED TVs": "/assets/generated/led-tv-55inch.dim_600x600.jpg",
};

export function getProductImage(name: string, category: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, img] of Object.entries(productImageMap)) {
    if (lowerName.includes(key)) return img;
  }
  return (
    categoryDefaults[category] ||
    "/assets/generated/kitchen-microwave.dim_600x600.jpg"
  );
}
