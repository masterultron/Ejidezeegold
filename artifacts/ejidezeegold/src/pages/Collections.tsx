import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { products, gramsToAED } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Plus } from 'lucide-react';

const CATEGORIES = ["All", "Necklaces", "Rings", "Earrings & Pendants", "Bracelets", "Sets"];

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { formatPrice, addToCart } = useCart();

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">The Collections</h1>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Explore our meticulously curated selection of fine jewelry. Each piece is a masterpiece of design and craftsmanship.
          </p>
        </header>

        {/* Filters */}
        <div className="flex overflow-x-auto no-scrollbar gap-8 justify-center border-b border-white/10 pb-6 mb-16">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap uppercase tracking-widest text-sm transition-colors ${
                activeCategory === cat ? 'text-primary' : 'text-white/50 hover:text-white'
              }`}
              data-testid={`btn-category-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-white/40 text-center py-24">
            No products in this category yet — populate <code className="text-primary/80">src/data/products.ts</code> to fill the collection.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 gap-y-16">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5 mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Hover overlay — desktop only */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center hidden md:flex">
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-primary text-black px-6 py-3 uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                      data-testid={`btn-add-cart-${product.id}`}
                    >
                      <Plus className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>

                  {/* Always visible on mobile — bottom of image */}
                  <div className="absolute bottom-0 left-0 right-0 md:hidden">
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-primary text-black py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:bg-white active:text-black transition-colors"
                      data-testid={`btn-add-cart-mobile-${product.id}`}
                    >
                      <Plus className="w-4 h-4" /> Add to Cart
                    </button>
                  </div>
                </div>

                <div className="text-center px-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{product.category}</p>
                  <h3 className="font-serif text-lg text-white mb-2 leading-tight">{product.name}</h3>
                  <p className="text-primary tracking-wider">{formatPrice(gramsToAED(product.weightInGrams))}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}