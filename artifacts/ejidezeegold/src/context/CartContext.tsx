import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product } from '@/data/products';

export type Currency = 'AED' | 'USD' | 'NGN';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  clearCart: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInAED: number) => string;
  totalItems: number;
  subtotal: number;
  subtotalInNGN: number;
  subtotalInUSD: number;
  goldPricePerGramAED: number;
  goldPriceUpdatedAt: Date | null;
  goldPriceLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── GOLD PRICING CONFIG ────────────────────────────────────────────
// Two modes, controlled by USE_LIVE_GOLD_PRICE below:
//   false (current) → uses MANUAL_PRICE_PER_GRAM_NGN as a fixed price.
//   true             → fetches the real gold spot price from a free API,
//                       caches it, and applies MARGIN_PERCENT on top.
// Flip the flag whenever you're ready to switch — nothing else needs to change.

const USE_LIVE_GOLD_PRICE = false;

// While USE_LIVE_GOLD_PRICE is false, this is the price actually used everywhere.
// Entered PER GRAM — change this one number to update all prices across the site.
const MANUAL_PRICE_PER_GRAM_NGN = 190000;

const GRAMS_PER_TROY_OUNCE = 31.1034768;

// Your margin on top of raw spot price (making charges, business margin, etc).
// Only applies when USE_LIVE_GOLD_PRICE is true.
// 0.15 = 15%. Change this one number to adjust margin across the whole site.
const MARGIN_PERCENT = 0.15;

// Used only if the live fetch fails AND there's no cached price yet.
// Update this occasionally by hand as a safety net — it is NOT the live price.
const FALLBACK_PRICE_PER_GRAM_AED = 492.5;

// How long a cached price is considered "fresh" before refetching.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const CACHE_KEY = 'ejidezee_gold_price_cache_v1';

const EXCHANGE_RATES: Record<Currency, number> = {
  AED: 1,
  USD: 0.272,
  NGN: 365.5,
};

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  AED: 'د.إ',
  USD: '$',
  NGN: '₦',
};

interface CachedPrice {
  pricePerGramAED: number;
  fetchedAt: number; // epoch ms
}

const readCache = (): CachedPrice | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedPrice;
  } catch {
    return null;
  }
};

const writeCache = (data: CachedPrice) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private browsing, etc) — safe to ignore, we just won't cache.
  }
};

// Fetches the live XAU (gold) spot price in USD per troy ounce from a free,
// no-auth-required API, converts it to AED per gram, and applies the margin.
// If this endpoint ever changes shape or goes down, swap it for another
// provider here — everything downstream just expects a number back.
const fetchLiveGoldPricePerGramAED = async (): Promise<number> => {
  const res = await fetch('https://api.gold-api.com/price/XAU');
  if (!res.ok) throw new Error('Gold price API request failed');
  const data = await res.json();

  const pricePerOunceUSD = data.price;
  if (typeof pricePerOunceUSD !== 'number' || pricePerOunceUSD <= 0) {
    throw new Error('Unexpected gold price API response');
  }

  const pricePerGramUSD = pricePerOunceUSD / GRAMS_PER_TROY_OUNCE;
  // EXCHANGE_RATES.USD represents "1 AED = 0.272 USD", so AED = USD / 0.272
  const pricePerGramAED = pricePerGramUSD / EXCHANGE_RATES.USD;

  return pricePerGramAED * (1 + MARGIN_PERCENT);
};

export const gramsToAED = (weightInGrams: number, pricePerGramAED: number): number => {
  return weightInGrams * pricePerGramAED;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<Currency>('AED');

  // Manual mode: price per gram in AED, derived once from MANUAL_PRICE_PER_GRAM_NGN.
  const manualPricePerGramAED = MANUAL_PRICE_PER_GRAM_NGN / EXCHANGE_RATES.NGN;

  // Seed with cached price (if any) so there's no flash of $0 / wrong price on load.
  const initialCache = typeof window !== 'undefined' ? readCache() : null;
  const [goldPricePerGramAED, setGoldPricePerGramAED] = useState<number>(
    USE_LIVE_GOLD_PRICE
      ? initialCache?.pricePerGramAED ?? FALLBACK_PRICE_PER_GRAM_AED
      : manualPricePerGramAED
  );
  const [goldPriceUpdatedAt, setGoldPriceUpdatedAt] = useState<Date | null>(
    USE_LIVE_GOLD_PRICE && initialCache ? new Date(initialCache.fetchedAt) : null
  );
  const [goldPriceLoading, setGoldPriceLoading] = useState(false);

  useEffect(() => {
    // Manual mode — skip fetching entirely, price is already set above.
    if (!USE_LIVE_GOLD_PRICE) return;

    const cached = readCache();
    const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

    if (isFresh) {
      setGoldPricePerGramAED(cached.pricePerGramAED);
      setGoldPriceUpdatedAt(new Date(cached.fetchedAt));
      return; // no need to refetch yet
    }

    let cancelled = false;
    setGoldPriceLoading(true);

    fetchLiveGoldPricePerGramAED()
      .then((price) => {
        if (cancelled) return;
        const now = Date.now();
        setGoldPricePerGramAED(price);
        setGoldPriceUpdatedAt(new Date(now));
        writeCache({ pricePerGramAED: price, fetchedAt: now });
      })
      .catch(() => {
        // Fetch failed — keep using whatever we already had (cached or fallback).
        // Don't throw; the site should keep working with the last known-good price.
      })
      .finally(() => {
        if (!cancelled) setGoldPriceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const incrementQuantity = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const formatPrice = (priceInAED: number) => {
    const converted = priceInAED * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
  () =>
    cart.reduce((sum, item) => {
      const priceAED = gramsToAED(item.product.weightInGrams ?? 0, goldPricePerGramAED);
      return sum + priceAED * item.quantity;
    }, 0),
  [cart, goldPricePerGramAED]
);
  const subtotalInNGN = useMemo(() => subtotal * EXCHANGE_RATES.NGN, [subtotal]);
  const subtotalInUSD = useMemo(() => subtotal * EXCHANGE_RATES.USD, [subtotal]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        currency,
        setCurrency,
        formatPrice,
        totalItems,
        subtotal,
        subtotalInNGN,
        subtotalInUSD,
        goldPricePerGramAED,
        goldPriceUpdatedAt,
        goldPriceLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};