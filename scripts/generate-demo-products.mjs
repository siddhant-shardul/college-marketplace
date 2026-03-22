import fs from "fs";
import path from "path";

const products = [
  {
    id: "prod_001",
    title: "Wireless Headphones",
    description: "Bluetooth headphones with soft ear cushions and long battery life.",
    price: 2499,
    category: "Electronics",
  },
  {
    id: "prod_002",
    title: "Scientific Calculator",
    description: "Useful for engineering and science students during exams and assignments.",
    price: 799,
    category: "Electronics",
  },
  {
    id: "prod_003",
    title: "USB Study Lamp",
    description: "Compact desk lamp with adjustable brightness for late-night study sessions.",
    price: 599,
    category: "Home",
  },
  {
    id: "prod_004",
    title: "Laptop Stand",
    description: "Portable foldable stand for better posture and airflow.",
    price: 899,
    category: "Accessories",
  },
  {
    id: "prod_005",
    title: "College Backpack",
    description: "Spacious backpack with laptop compartment and side bottle pockets.",
    price: 1299,
    category: "Accessories",
  },
  {
    id: "prod_006",
    title: "Water Bottle",
    description: "Leak-proof stainless steel bottle suitable for classes and gym.",
    price: 349,
    category: "Accessories",
  },
  {
    id: "prod_007",
    title: "Casual Sneakers",
    description: "Comfortable daily-wear sneakers for campus use.",
    price: 1899,
    category: "Fashion",
  },
  {
    id: "prod_008",
    title: "Hoodie",
    description: "Soft cotton hoodie, good for winter mornings and evening classes.",
    price: 999,
    category: "Fashion",
  },
  {
    id: "prod_009",
    title: "Graphic T-Shirt",
    description: "Regular-fit t-shirt for casual college wear.",
    price: 499,
    category: "Fashion",
  },
  {
    id: "prod_010",
    title: "Analog Watch",
    description: "Simple everyday watch with a clean dial and durable strap.",
    price: 1499,
    category: "Accessories",
  },
  {
    id: "prod_011",
    title: "Bluetooth Speaker",
    description: "Portable speaker with decent bass and USB charging.",
    price: 1599,
    category: "Electronics",
  },
  {
    id: "prod_012",
    title: "Power Bank",
    description: "Fast-charging power bank useful during travel and long college days.",
    price: 1199,
    category: "Electronics",
  },
  {
    id: "prod_013",
    title: "Mechanical Keyboard",
    description: "Tactile keyboard for coding, gaming, and long typing sessions.",
    price: 2999,
    category: "Electronics",
  },
  {
    id: "prod_014",
    title: "Wireless Mouse",
    description: "Compact wireless mouse for laptop users and coding work.",
    price: 699,
    category: "Electronics",
  },
  {
    id: "prod_015",
    title: "Notebook Set",
    description: "Pack of ruled notebooks for class notes and assignments.",
    price: 299,
    category: "Home",
  },
  {
    id: "prod_016",
    title: "Study Chair Cushion",
    description: "Extra seat cushion for long study hours and better comfort.",
    price: 549,
    category: "Home",
  },
  {
    id: "prod_017",
    title: "Yoga Mat",
    description: "Non-slip mat for stretching, yoga, and hostel workouts.",
    price: 799,
    category: "Fitness",
  },
  {
    id: "prod_018",
    title: "Resistance Bands",
    description: "Useful for light workouts, warmups, and home exercise.",
    price: 399,
    category: "Fitness",
  },
  {
    id: "prod_019",
    title: "Running Shoes",
    description: "Lightweight shoes for jogging, gym, and sports practice.",
    price: 2299,
    category: "Fitness",
  },
  {
    id: "prod_020",
    title: "Gym Duffel Bag",
    description: "Compact gym bag with enough room for shoes and essentials.",
    price: 999,
    category: "Fitness",
  },
  {
    id: "prod_021",
    title: "Desk Organizer",
    description: "Keeps pens, notes, chargers, and small accessories in one place.",
    price: 449,
    category: "Home",
  },
  {
    id: "prod_022",
    title: "Phone Tripod",
    description: "Mini tripod for recording presentations, reels, and video calls.",
    price: 799,
    category: "Electronics",
  },
  {
    id: "prod_023",
    title: "Sling Bag",
    description: "Small crossbody bag for carrying wallet, phone, and keys.",
    price: 749,
    category: "Fashion",
  },
  {
    id: "prod_024",
    title: "Bedside Lamp",
    description: "Warm light lamp ideal for hostel rooms and reading corners.",
    price: 699,
    category: "Home",
  },
  {
    id: "prod_025",
    title: "Leather Wallet",
    description: "Slim wallet with card slots and a simple premium finish.",
    price: 649,
    category: "Accessories",
  },
];

const colors = {
  Electronics: ["#0f172a", "#1e293b"],
  Fashion: ["#7c2d12", "#9a3412"],
  Accessories: ["#1d4ed8", "#2563eb"],
  Home: ["#065f46", "#047857"],
  Fitness: ["#7e22ce", "#9333ea"],
};

const iconMap = {
  Electronics: "⌁",
  Fashion: "◈",
  Accessories: "◎",
  Home: "▣",
  Fitness: "▲",
};

const outDir = path.join(process.cwd(), "public", "products");
fs.mkdirSync(outDir, { recursive: true });

for (const product of products) {
  const [c1, c2] = colors[product.category] ?? ["#111827", "#374151"];
  const icon = iconMap[product.category] ?? "●";
  const imagePath = `/products/${product.id}.svg`;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)" rx="32" />
  <rect x="36" y="36" width="728" height="528" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
  <text x="70" y="120" fill="white" font-size="28" font-family="Arial, Helvetica, sans-serif" opacity="0.9">${product.category}</text>
  <text x="70" y="220" fill="white" font-size="120" font-family="Arial, Helvetica, sans-serif">${icon}</text>
  <text x="70" y="340" fill="white" font-size="48" font-weight="700" font-family="Arial, Helvetica, sans-serif">${product.title}</text>
  <text x="70" y="405" fill="white" font-size="30" font-family="Arial, Helvetica, sans-serif" opacity="0.9">₹${product.price}</text>
  <text x="70" y="500" fill="white" font-size="22" font-family="Arial, Helvetica, sans-serif" opacity="0.75">College Marketplace Demo</text>
</svg>`.trim();

  fs.writeFileSync(path.join(outDir, `${product.id}.svg`), svg, "utf8");
  product.image = imagePath;
}

fs.writeFileSync(
  path.join(process.cwd(), "data", "products.json"),
  JSON.stringify(products, null, 2),
  "utf8"
);

console.log("Generated products.json and local product placeholder images.");
