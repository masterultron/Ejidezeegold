import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { products } from '@/data/products';
import { useCart, gramsToAED } from '@/context/CartContext';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const { formatPrice, goldPricePerGramAED } = useCart();
  
  // Specifically find the first Set, then fill the remaining 2 slots with other unique categories
  const firstSet = products.find((p) => p.category === 'Sets');
  const otherFeatured = products.reduce((acc, product) => {
    if (acc.length < 2 && product.category !== 'Sets' && !acc.find((p) => p.category === product.category)) {
      acc.push(product);
    }
    return acc;
  }, [] as typeof products);
  
  const featured = firstSet ? [firstSet, ...otherFeatured] : otherFeatured;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1777286492764-456e3530e34c?auto=format&fit=crop&q=80&w=2000"
            alt="Gold jewelry background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-primary tracking-[0.3em] uppercase text-xs md:text-sm mb-6"
          >
            Ejidezee Gold International
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight"
          >
            Elegance <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-200 to-primary">As Unique As You.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link href="/collections" className="inline-flex items-center gap-2 border border-primary px-8 py-4 text-primary hover:bg-primary hover:text-black transition-all uppercase tracking-widest text-sm group" data-testid="link-collections-hero">
              View The Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-32 px-6 md:px-12 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-8">A Signature, Uniquely Yours</h2>
          <p className="text-white/70 leading-relaxed text-lg md:text-xl font-light">
            Ejidezee Gold International curates fine gold jewelry for those who wear their identity with pride.
            Every piece is meticulously selected, transforming precious metal into wearable arts that reflects
            the individuality of the one who wears it. Step into a world where elegance is never generic —
            it is crafted, considered, and entirely your own.
          </p>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">Featured Curations</h2>
              <p className="text-primary tracking-widest uppercase text-sm">Exceptional pieces for the elite.</p>
            </div>
            <Link href="/collections" className="text-white/60 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1 uppercase tracking-widest text-sm" data-testid="link-collections-discover">
              Discover All
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="text-white/40 text-center py-16">
              No products added yet — populate <code className="text-primary/80">src/data/products.ts</code> to see featured curations here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="group cursor-pointer block"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-white/5">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{product.category}</p>
                    <h3 className="text-xl font-serif text-white mb-2">{product.name}</h3>
                    <p className="text-primary tracking-wider">
                      {product.priceOnRequest 
                        ? "Price on Request" 
                        : formatPrice(gramsToAED(product.weightInGrams ?? 0, goldPricePerGramAED))}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}