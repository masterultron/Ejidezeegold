// ─── PRICING CONFIG ───────────────────────────────────────────────
// 1g of gold in NGN. Change this one number to update all prices.
const GOLD_PRICE_PER_GRAM_NGN = 180000;
const NGN_TO_AED = 365.5;

// Converts weight to AED base price automatically
export const gramsToAED = (grams: number): number =>
  (grams * GOLD_PRICE_PER_GRAM_NGN) / NGN_TO_AED;

export interface Product {
  id: string;
  name: string;
  description: string;
  category: "Necklaces" | "Rings" | "Earrings & Pendants" | "Bracelets" | "Sets";
  image: string;
  weightInGrams: number;
}

// TODO: Add Ejidezee Gold International's real product catalog here.
// Same shape as before — id, name, description, category, image path, weightInGrams.
// Example:
// { id: "p1", name: "The Golden Bloom Dome", weightInGrams: 7.10, description: "...", category: "Rings", image: "/images/Rings/1.JPG" },

export const products: Product[] = [];