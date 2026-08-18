import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useCart, gramsToAED } from '@/context/CartContext';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, incrementQuantity, decrementQuantity, subtotal, formatPrice, goldPricePerGramAED } = useCart();
  const [, setLocation] = useLocation();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="font-serif text-2xl text-white">Your Cart</h2>
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors" data-testid="btn-close-cart">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/50 space-y-4">
                    <p className="text-lg">Your cart is empty.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 items-center">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-24 object-cover border border-white/10" />
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{item.product.name}</h3>
                        <p className="text-primary text-sm mt-1">{formatPrice(gramsToAED(item.product.weightInGrams ?? 0, goldPricePerGramAED))}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center border border-white/20">
                            <button onClick={() => decrementQuantity(item.product.id)} className="p-1 text-white/60 hover:text-white">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                            <button onClick={() => incrementQuantity(item.product.id)} className="p-1 text-white/60 hover:text-white">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-white/40 hover:text-destructive underline underline-offset-4">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-white/10 bg-black/40 space-y-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-white/80">Subtotal</span>
                    <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-primary text-black hover:bg-primary/90 font-medium rounded-none h-12 uppercase tracking-widest text-sm"
                      onClick={() => {
                        onClose();
                        setLocation('/checkout');
                      }}
                    >
                      Secure Checkout
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary/10 rounded-none h-12 uppercase tracking-widest text-sm"
                      onClick={() => setIsInquiryOpen(true)}
                    >
                      Proceed to Inquiry
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <RoyalInquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
};

const RoyalInquiryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', requests: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentMethod, setSentMethod] = useState('');
  const { cart } = useCart();

  // TODO: VENDOR_EMAIL is a placeholder — replace with the real Ejidezee Gold International inquiry inbox.
  const VENDOR_WHATSAPP = '971528828956';
  const VENDOR_EMAIL = 'lorem.ipsum@example.com';

  const handleNext = () => setStep(2);
  const handleNext3 = () => setStep(3);

  const handleSend = (method: string) => {
    const itemsList = cart
      .map((item) => item.product.name + ' x' + item.quantity)
      .join(', ');

    const text =
      'Hello Ejidezee Gold International,' +
      '\n\nName: ' + formData.name +
      '\nPhone: ' + formData.phone +
      '\n\nItems: ' + itemsList +
      '\n\nSpecial Requests: ' + (formData.requests || 'None');

    if (method === 'WhatsApp') {
      window.open(
        'https://wa.me/' + VENDOR_WHATSAPP + '?text=' + encodeURIComponent(text),
        '_blank'
      );
    }

    if (method === 'Email') {
      const subject = encodeURIComponent('Inquiry from ' + formData.name + ' - Ejidezee Gold International');
      const body = encodeURIComponent(text);
      window.open(
        'mailto:' + VENDOR_EMAIL + '?subject=' + subject + '&body=' + body,
        '_blank'
      );
    }

    setSentMethod(method);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setSentMethod('');
    setStep(1);
    setFormData({ name: '', phone: '', requests: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            <div
              className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500 ease-in-out"
              style={{ width: showSuccess ? '100%' : (step / 3) * 100 + '%' }}
            />

            <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10 min-h-[400px] flex flex-col">
              <AnimatePresence mode="wait">

                {showSuccess && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5 mb-6">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl text-white mb-3">Inquiry Sent</h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-8">
                      Your inquiry has been sent via{' '}
                      <span className="text-primary font-semibold">{sentMethod}</span>.
                      Our concierge will be in touch with you shortly.
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full bg-primary text-black hover:bg-primary/90 py-3 uppercase tracking-widest text-xs font-bold transition-colors"
                    >
                      Close
                    </button>
                  </motion.div>
                )}

                {!showSuccess && step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                    <h2 className="font-serif text-2xl text-primary mb-2">Royal Inquiry</h2>
                    <p className="text-white/60 text-sm mb-8">Please provide your details so our concierges may assist you personally.</p>
                    <div className="space-y-6 flex-1">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/80 mb-2">Phone / WhatsApp</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-primary focus:outline-none transition-colors"
                          placeholder="+971 52 882 8956"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.name || !formData.phone}
                      className="w-full bg-primary text-black hover:bg-primary/90 rounded-none mt-8 h-12 uppercase tracking-widest text-sm"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {!showSuccess && step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                    <h2 className="font-serif text-2xl text-primary mb-2">Custom Requests</h2>
                    <p className="text-white/60 text-sm mb-8">Any specific ring sizes, engraving, or special packaging required?</p>
                    <div className="flex-1">
                      <textarea
                        value={formData.requests}
                        onChange={(e) => setFormData({ ...formData, requests: e.target.value })}
                        className="w-full h-32 bg-transparent border border-white/20 p-4 text-white focus:border-primary focus:outline-none transition-colors resize-none"
                        placeholder="e.g. Need ring sized to 7.5, please include gift wrapping..."
                      />
                    </div>
                    <div className="flex gap-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-white/20 text-white hover:bg-white/5 rounded-none h-12 uppercase tracking-widest text-sm"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext3}
                        className="flex-1 bg-primary text-black hover:bg-primary/90 rounded-none h-12 uppercase tracking-widest text-sm"
                      >
                        Review <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!showSuccess && step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col text-center">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h2 className="font-serif text-2xl text-white mb-2">Ready to Connect</h2>
                    <p className="text-white/60 text-sm mb-8">Choose your preferred method to complete this inquiry with our team.</p>
                    <div className="grid grid-cols-1 gap-4 flex-1 content-center">
                      <button
                        onClick={() => handleSend('WhatsApp')}
                        className="p-6 border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/5 transition-all text-left group"
                      >
                        <h4 className="text-primary font-serif text-xl group-hover:translate-x-2 transition-transform">Send to WhatsApp</h4>
                        <p className="text-white/50 text-sm mt-1">Instant connection with a concierge.</p>
                      </button>
                      <button
                        onClick={() => handleSend('Email')}
                        className="p-6 border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/5 transition-all text-left group"
                      >
                        <h4 className="text-primary font-serif text-xl group-hover:translate-x-2 transition-transform">Send via Email</h4>
                        <p className="text-white/50 text-sm mt-1">We will reply within 24 hours.</p>
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};