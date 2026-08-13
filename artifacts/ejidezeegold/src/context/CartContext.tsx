import React, { createContext, useContext, useState, useMemo } from 'react';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GOLD_PRICE_PER_GRAM_NGN = 180000;

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

export const gramsToAED = (weightInGrams: number): number => {
  return (weightInGrams * GOLD_PRICE_PER_GRAM_NGN) / EXCHANGE_RATES.NGN;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currency, setCurrency] = useState<Currency>('AED');

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
        const priceAED = gramsToAED(item.product.weightInGrams);
        return sum + priceAED * item.quantity;
      }, 0),
    [cart]
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