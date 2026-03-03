// Static product catalog – always displayed in the storefront.
// Products added via the Admin Panel (backend) are merged on top of these.

export interface StaticProduct {
  id: number; // negative IDs to avoid clash with backend IDs (which start at 0)
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  inStock: boolean;
}

export const STATIC_PRODUCTS: StaticProduct[] = [
  // ─── Refrigerators ───────────────────────────────────────────────
  {
    id: -1,
    name: "Samsung 400L Double Door",
    price: 799.99,
    description:
      "Spacious frost-free double door fridge with digital inverter compressor.",
    category: "Refrigerators",
    image: "/assets/generated/refrigerator-double-door.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -2,
    name: "LG 345L Single Door",
    price: 599.99,
    description:
      "Energy-efficient single door refrigerator with smart inverter compressor.",
    category: "Refrigerators",
    image: "/assets/generated/refrigerator-single-door.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -3,
    name: "Whirlpool 500L Side-by-Side",
    price: 999.99,
    description:
      "High-capacity side-by-side fridge with in-door water dispenser.",
    category: "Refrigerators",
    image: "/assets/generated/refrigerator-side-by-side.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -4,
    name: "Haier 343L Convertible",
    price: 650.0,
    description: "Convertible freezer-to-fridge with twin inverter technology.",
    category: "Refrigerators",
    image: "/assets/generated/refrigerator-french-door.dim_600x600.jpg",
    inStock: true,
  },

  // ─── Air Conditioners ────────────────────────────────────────────
  {
    id: -5,
    name: "Daikin 1.5 Ton Inverter Split AC",
    price: 499.99,
    description:
      "Energy-efficient split AC with fast cooling mode and PM 2.5 filter.",
    category: "Air Conditioners",
    image: "/assets/generated/ac-split-unit.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -6,
    name: "Voltas 2 Ton Window AC",
    price: 399.99,
    description: "Powerful window AC ideal for large rooms up to 200 sq ft.",
    category: "Air Conditioners",
    image: "/assets/generated/ac-window-unit.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -7,
    name: "Carrier 1 Ton Split AC",
    price: 350.0,
    description: "Affordable and compact cooling with 3-star energy rating.",
    category: "Air Conditioners",
    image: "/assets/generated/ac-inverter.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -8,
    name: "Godrej 1.5 Ton 5-Star Smart AC",
    price: 550.0,
    description:
      "Premium AC with Wi-Fi, voice control, and 5-star energy rating.",
    category: "Air Conditioners",
    image: "/assets/generated/ac-portable.dim_600x600.jpg",
    inStock: true,
  },

  // ─── Fans ────────────────────────────────────────────────────────
  {
    id: -9,
    name: "Orient 1200mm Ceiling Fan",
    price: 49.99,
    description: "High-speed ceiling fan with energy-efficient copper motor.",
    category: "Fans",
    image: "/assets/generated/fan-ceiling.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -10,
    name: "Bajaj Airmax Pedestal Fan",
    price: 34.99,
    description:
      "Adjustable pedestal fan with three-speed settings and wide sweep.",
    category: "Fans",
    image: "/assets/generated/fan-pedestal.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -11,
    name: "Usha Tower Fan",
    price: 89.99,
    description:
      "Slim tower fan with oscillation, 3 speeds, and timer function.",
    category: "Fans",
    image: "/assets/generated/fan-tower.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -12,
    name: "Havells Table Fan",
    price: 39.99,
    description: "Compact desk/table fan with oscillation and quiet operation.",
    category: "Fans",
    image: "/assets/generated/fan-table.dim_600x600.jpg",
    inStock: true,
  },

  // ─── Kitchen Appliances ──────────────────────────────────────────
  {
    id: -13,
    name: "Philips 750W Mixer Grinder",
    price: 69.99,
    description: "Powerful mixer grinder with 3 stainless steel jars.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-blender.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -14,
    name: "Preethi Electric Rice Cooker",
    price: 59.99,
    description:
      "Safe, efficient electric rice cooker with keep-warm function.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-rice-cooker.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -15,
    name: "Bajaj Auto Pop-up Toaster",
    price: 24.99,
    description:
      "2-slice toaster with removable crumb tray and browning control.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-toaster.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -16,
    name: "Morphy Richards 17L Microwave",
    price: 125.0,
    description:
      "Solo microwave oven with mechanical control and auto-defrost.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-microwave.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -17,
    name: "Havells 1.7L Electric Kettle",
    price: 29.99,
    description: "Fast-boil stainless steel kettle with auto shut-off.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-kettle.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -18,
    name: "Prestige Sandwich Maker",
    price: 39.99,
    description:
      "Non-stick sandwich maker with indicator lights and cool-touch handle.",
    category: "Kitchen Appliances",
    image: "/assets/generated/kitchen-sandwich-maker.dim_600x600.jpg",
    inStock: true,
  },

  // ─── LED TVs ─────────────────────────────────────────────────────
  {
    id: -19,
    name: 'Samsung 32" HD Smart TV',
    price: 249.99,
    description:
      "Crystal HD display with Tizen OS, built-in Wi-Fi, and voice assistant.",
    category: "LED TVs",
    image: "/assets/generated/led-tv-32inch.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -20,
    name: 'Sony 55" 4K Ultra HD Android TV',
    price: 599.99,
    description:
      "Vivid 4K BRAVIA display with Android TV, Google Assistant, and Dolby Audio.",
    category: "LED TVs",
    image: "/assets/generated/led-tv-55inch.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -21,
    name: 'OnePlus 65" 4K QLED TV',
    price: 799.99,
    description:
      "Quantum LED display with Dolby Vision, HDMI 2.1, and OxygenPlay.",
    category: "LED TVs",
    image: "/assets/generated/led-tv-65inch.dim_600x600.jpg",
    inStock: true,
  },
  {
    id: -22,
    name: 'Panasonic 75" 4K LED Smart TV',
    price: 1099.99,
    description:
      "Cinema-grade 75-inch 4K display with smart connectivity and Dolby Atmos.",
    category: "LED TVs",
    image: "/assets/generated/led-tv-75inch.dim_600x600.jpg",
    inStock: true,
  },
];
