import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products, CATEGORY_TREE, Category, Subcategory, Product } from '@/data/products';
import { useCart, gramsToAED } from '@/context/CartContext';
import { Plus, ChevronDown, MessageCircle, X, CheckCircle2 } from 'lucide-react';

const CATEGORIES: Category[] = ["Necklaces", "Rings", "Earrings", "Bracelets", "Sets", "Watches"];

// TODO: VENDOR_EMAIL is a placeholder — replace with the real Ejidezee inquiry inbox.
const VENDOR_WHATSAPP = '971528828956';
const VENDOR_EMAIL = 'lorem.ipsum@example.com';

export default function Collections() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [activeSubcategory, setActiveSubcategory] = useState<Subcategory | "All">("All");
  const { formatPrice, addToCart, goldPricePerGramAED } = useCart();
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  const handleCategoryClick = (cat: Category | "All") => {
    setActiveCategory(cat);
    setActiveSubcategory("All");
  };

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== "All" && p.category !== activeCategory) return false;
    if (activeSubcategory !== "All" && p.subcategory !== activeSubcategory) return false;
    return true;
  });

  const activeDropdownOptions = activeCategory !== "All" ? CATEGORY_TREE[activeCategory] : undefined;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">The Collections</h1>
          <p className="text-white/60 max-w-2xl mx-auto leading-relaxed">
            Explore our meticulously curated selection of fine jewelry. Each piece is a masterpiece of design and craftsmanship.
          </p>
        </header>

        {/* Top-level category filters */}
        <div className="flex overflow-x-auto no-scrollbar gap-8 justify-center border-b border-white/10 pb-6 mb-4">
          <button
            onClick={() => handleCategoryClick("All")}
            className={`whitespace-nowrap uppercase tracking-widest text-sm transition-colors ${
              activeCategory === "All" ? 'text-primary' : 'text-white/50 hover:text-white'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`whitespace-nowrap uppercase tracking-widest text-sm transition-colors flex items-center gap-1 ${
                activeCategory === cat ? 'text-primary' : 'text-white/50 hover:text-white'
              }`}
              data-testid={`btn-category-${cat}`}
            >
              {cat}
              {CATEGORY_TREE[cat] && <ChevronDown className="w-3 h-3" />}
            </button>
          ))}
        </div>

        {/* Subcategory dropdown row */}
        <AnimatePresence>
          {activeDropdownOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 justify-center mb-12 pb-2">
                <button
                  onClick={() => setActiveSubcategory("All")}
                  className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
                    activeSubcategory === "All"
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                  }`}
                >
                  All {activeCategory}
                </button>
                {activeDropdownOptions.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setActiveSubcategory(sub)}
                    className={`px-4 py-1.5 text-xs uppercase tracking-widest border transition-colors ${
                      activeSubcategory === sub
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeDropdownOptions && <div className="mb-16" />}

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-white/40 text-center py-24">
            No products in this selection yet — populate <code className="text-primary/80">src/data/products.ts</code> to fill the collection.
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
                    {product.priceOnRequest ? (
                      <button
                        onClick={() => setInquiryProduct(product)}
                        className="bg-primary text-black px-6 py-3 uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                        data-testid={`btn-inquire-${product.id}`}
                      >
                        <MessageCircle className="w-4 h-4" /> Inquire
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-primary text-black px-6 py-3 uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                        data-testid={`btn-add-cart-${product.id}`}
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    )}
                  </div>

                  {/* Always visible on mobile */}
                  <div className="absolute bottom-0 left-0 right-0 md:hidden">
                    {product.priceOnRequest ? (
                      <button
                        onClick={() => setInquiryProduct(product)}
                        className="w-full bg-primary text-black py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:bg-white active:text-black transition-colors"
                        data-testid={`btn-inquire-mobile-${product.id}`}
                      >
                        <MessageCircle className="w-4 h-4" /> Inquire
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-primary text-black py-3 uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:bg-white active:text-black transition-colors"
                        data-testid={`btn-add-cart-mobile-${product.id}`}
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-center px-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                    {product.category}{product.subcategory ? ` · ${product.subcategory}` : ''}
                  </p>
                  <h3 className="font-serif text-lg text-white mb-2 leading-tight">{product.name}</h3>
                  {product.priceOnRequest || product.weightInGrams === undefined ? (
                    <p className="text-white/40 text-[11px] leading-snug">
                      Send us a message to inquire about weight and price
                    </p>
                  ) : (
                    <p className="text-primary tracking-wider">{formatPrice(gramsToAED(product.weightInGrams, goldPricePerGramAED))}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <InquiryModal product={inquiryProduct} onClose={() => setInquiryProduct(null)} />
    </div>
  );
}

const InquiryModal: React.FC<{ product: Product | null; onClose: () => void }> = ({ product, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentMethod, setSentMethod] = useState('');

  // Prefill the message whenever a new product is opened
  React.useEffect(() => {
    if (product) {
      setMessage(`I want to inquire about how "${product.name}" is sold (the weight and price).`);
    }
  }, [product]);

  const handleClose = () => {
    setShowSuccess(false);
    setSentMethod('');
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  const handleSend = (method: 'WhatsApp' | 'Email') => {
    const text =
      'Hello Ejidezee Gold International,' +
      '\n\nName: ' + name +
      '\nPhone: ' + phone +
      '\nEmail: ' + email +
      '\n\nMessage: ' + message;

    if (method === 'WhatsApp') {
      window.open('https://wa.me/' + VENDOR_WHATSAPP + '?text=' + encodeURIComponent(text), '_blank');
    } else {
      const subject = encodeURIComponent('Product Inquiry from ' + name + ' - Ejidezee Gold International');
      const body = encodeURIComponent(text);
      window.open('mailto:' + VENDOR_EMAIL + '?subject=' + subject + '&body=' + body, '_blank');
    }

    setSentMethod(method);
    setShowSuccess(true);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0a0a0a] border border-white/10 w-full max-w-lg relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 h-1 bg-primary w-full" />

            <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10 max-h-[85vh] overflow-y-auto">
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5 mb-6">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="font-serif text-2xl text-white mb-3">Inquiry Sent</h2>
                  <p className="text-white/50 text-sm leading-relaxed mb-8">
                    Your inquiry has been sent via{' '}
                    <span className="text-primary font-semibold">{sentMethod}</span>.
                    Our team will be in touch with you shortly.
                  </p>
                  <button
                    onClick={handleClose}
                    className="w-full bg-primary text-black hover:bg-primary/90 py-3 uppercase tracking-widest text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-2xl text-primary mb-1">Product Inquiry</h2>
                  <p className="text-white/60 text-sm mb-8">{product.name}</p>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                        placeholder="+971 52 882 8956"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-transparent border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors resize-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 mt-8">
                    <button
                      onClick={() => handleSend('WhatsApp')}
                      disabled={!name || !phone}
                      className="w-full bg-primary text-black hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed py-3 uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      Send via WhatsApp
                    </button>
                    <button
                      onClick={() => handleSend('Email')}
                      disabled={!name || !email}
                      className="w-full border border-primary text-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed py-3 uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      Send via Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};