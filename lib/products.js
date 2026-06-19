export const seedProducts = [
  {
    id: "p001",
    slug: "obsidian-oversized-blazer",
    name: "Obsidian Oversized Blazer",
    category: "apparel",
    price: 189,
    originalPrice: 220,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4e2e?w=800&q=90",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90"
    ],
    sizes: ["XS","S","M","L","XL","XXL"],
    description: "A masterclass in understated power. This oversized blazer is crafted from a premium wool-blend fabric with a structured silhouette that commands attention without demanding it. The clean, minimal cut pairs effortlessly with tailored trousers or elevated denim.",
    details: ["Premium wool-blend fabric","Structured oversized fit","Two front flap pockets","Single back vent","Fully lined interior","Dry clean recommended"],
    inStock: true,
    featured: true,
    badge: "New Arrival"
  },
  {
    id: "p002",
    slug: "velour-track-set",
    name: "Velour Signature Track Set",
    category: "apparel",
    price: 145,
    originalPrice: 175,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=90",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=90"
    ],
    sizes: ["XS","S","M","L","XL"],
    description: "Luxurious velour meets modern athletic silhouette. This signature two-piece set offers unrivaled softness and a sleek, refined aesthetic — perfect for elevated loungewear or street-ready styling.",
    details: ["Premium velour fabric","Relaxed zip-up jacket","High-waist tapered trousers","Embroidered ZELUX logo","Machine washable"],
    inStock: true,
    featured: true,
    badge: "Bestseller"
  },
  {
    id: "p003",
    slug: "sculpted-leather-mule",
    name: "Sculpted Leather Mule",
    category: "footwear",
    price: 165,
    originalPrice: 195,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=90",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=800&q=90"
    ],
    sizes: ["US 6","US 7","US 8","US 9","US 10","US 11"],
    description: "An architectural vision in premium leather. These sculpted mules feature a refined block heel and a clean, minimal upper that transitions seamlessly from daytime elegance to evening sophistication.",
    details: ["Full-grain leather upper","4cm structured block heel","Cushioned insole","Leather-lined interior","Rubber anti-slip sole"],
    inStock: true,
    featured: false,
    badge: null
  },
  {
    id: "p004",
    slug: "elite-runner-sneaker",
    name: "Elite Runner Sneaker",
    category: "footwear",
    price: 210,
    originalPrice: 250,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=90",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=90"
    ],
    sizes: ["US 7","US 8","US 9","US 10","US 11","US 12"],
    description: "Where performance engineering meets luxury design. The Elite Runner features an ultra-lightweight knit upper, a responsive foam midsole, and a sleek profile that makes it the definitive sneaker for the modern connoisseur.",
    details: ["Premium knit upper","Responsive EVA foam midsole","Ortholite insole","Rubber outsole","Available in Bone White and Obsidian"],
    inStock: true,
    featured: true,
    badge: "Limited"
  },
  {
    id: "p005",
    slug: "cashmere-turtleneck",
    name: "Pure Cashmere Turtleneck",
    category: "apparel",
    price: 225,
    originalPrice: 270,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=90",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=90"
    ],
    sizes: ["XS","S","M","L","XL"],
    description: "The pinnacle of cold-weather luxury. Woven from 100% Grade-A Mongolian cashmere, this ribbed turtleneck offers incomparable softness, natural temperature regulation, and a timeless silhouette that never goes out of style.",
    details: ["100% Grade-A Mongolian cashmere","Fine rib knit texture","Slim-fit turtleneck silhouette","Dry clean only","Available in Ivory, Camel, and Slate Grey"],
    inStock: true,
    featured: false,
    badge: "Premium"
  },
  {
    id: "p006",
    slug: "noir-wireless-earbuds",
    name: "Noir Pro Wireless Earbuds",
    category: "electronics",
    price: 149,
    originalPrice: 185,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=90",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=90"
    ],
    variants: ["Matte Black","Pearl White","Champagne Gold"],
    description: "Audiophile-grade sound wrapped in a minimal, jewelry-like design. The Noir Pro features active noise cancellation, a 32-hour total battery life, and a premium leather charging case that doubles as a statement accessory.",
    specs: {
      "Driver Size": "11mm Dynamic",
      "Frequency Response": "20Hz – 20kHz",
      "ANC": "Up to -35dB",
      "Battery": "8hr buds + 24hr case",
      "Connectivity": "Bluetooth 5.3",
      "Water Resistance": "IPX5"
    },
    inStock: true,
    featured: true,
    badge: "Top Rated"
  },
  {
    id: "p007",
    slug: "ultra-slim-smartwatch",
    name: "Atelier Ultra-Slim Smartwatch",
    category: "electronics",
    price: 295,
    originalPrice: 359,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=90",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=90"
    ],
    variants: ["Silver / White Band","Gold / Black Band","Rose Gold / Nude Band"],
    description: "Precision Swiss-inspired engineering in a 6.9mm ultra-slim profile. The Atelier watch merges health monitoring technology with a design language drawn from haute horlogerie — a timepiece for those who refuse to compromise.",
    specs: {
      "Case Thickness": "6.9mm",
      "Display": "1.78\" AMOLED 60Hz",
      "Health Sensors": "SpO2, ECG, Stress",
      "Battery Life": "Up to 14 days",
      "Water Resistance": "5ATM",
      "Connectivity": "Bluetooth 5.2 + GPS"
    },
    inStock: true,
    featured: true,
    badge: "New Arrival"
  },
  {
    id: "p008",
    slug: "portable-magsafe-charger",
    name: "MagCore Portable Charger",
    category: "electronics",
    price: 89,
    originalPrice: 110,
    images: [
      "https://images.unsplash.com/photo-1609592424810-d2b0c64ab31b?w=800&q=90",
      "https://images.unsplash.com/photo-1618386629069-e6c83e5a1fd6?w=800&q=90"
    ],
    variants: ["Space Black","Arctic White"],
    description: "Wireless charging, perfected. The MagCore features a 10,000mAh capacity in a paper-thin aluminum shell with MagSafe-compatible alignment and a built-in braided USB-C cable. Designed for the traveler who demands beauty and utility in equal measure.",
    specs: {
      "Capacity": "10,000mAh",
      "Wireless Output": "15W MagSafe / 10W Qi",
      "Wired Output": "45W USB-C PD",
      "Thickness": "11mm",
      "Material": "Anodized aluminum",
      "Weight": "185g"
    },
    inStock: true,
    featured: false,
    badge: null
  },
  {
    id: "p009",
    slug: "4k-mini-projector",
    name: "Lumière 4K Pocket Projector",
    category: "electronics",
    price: 385,
    originalPrice: 450,
    images: [
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=90",
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=90"
    ],
    variants: ["Obsidian Black"],
    description: "Cinema-quality projection in a device smaller than a hardback book. The Lumière 4K delivers 1000 ANSI lumens of brilliance, auto-keystone correction, and built-in Dolby Audio — transforming any surface into a luxury viewing experience.",
    specs: {
      "Resolution": "3840 × 2160 (4K)",
      "Brightness": "1000 ANSI Lumens",
      "Contrast": "1500:1",
      "Audio": "Dolby Atmos 2×5W",
      "Connectivity": "HDMI 2.0, USB-C, WiFi 6",
      "Battery": "2.5hr built-in"
    },
    inStock: true,
    featured: false,
    badge: "Premium"
  },
  {
    id: "p010",
    slug: "titanium-phone-case",
    name: "Titan Series Phone Armor",
    category: "electronics",
    price: 95,
    originalPrice: 120,
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=90",
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=800&q=90"
    ],
    variants: ["iPhone 15 Pro Max","iPhone 15 Pro","iPhone 15","Samsung S24 Ultra","Samsung S24+"],
    description: "Military-grade protection with a jeweler's touch. Machined from aerospace-grade titanium and lined with aramid fiber, the Titan Series is the last phone case you will ever need — and the most beautiful.",
    specs: {
      "Material": "Grade-5 Titanium + Aramid Fiber",
      "Drop Protection": "MIL-STD-810H (6ft)",
      "Weight": "62g",
      "MagSafe": "Compatible",
      "Finish": "Brushed matte titanium"
    },
    inStock: true,
    featured: false,
    badge: null
  }
];

export function getProductBySlug(productsList, slug) {
  return productsList.find(p => p.slug === slug) || null;
}

export function getFeaturedProducts(productsList) {
  return productsList.filter(p => p.featured);
}

export function getProductsByCategory(productsList, cat) {
  return productsList.filter(p => p.category === cat);
}
