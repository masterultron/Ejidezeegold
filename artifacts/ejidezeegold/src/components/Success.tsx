import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export const Success = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingOrder');
    if (!raw) return;

    try {
      const orderData = JSON.parse(raw);
      fetch('/.netlify/functions/order-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          reference: 'PAYPAL-' + Date.now(),
        }),
      }).finally(() => {
        sessionStorage.removeItem('pendingOrder');
      });
    } catch (err) {
      console.error('Failed to send PayPal notification:', err);
      sessionStorage.removeItem('pendingOrder');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full border border-white/10 bg-black/40 p-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full border border-primary flex items-center justify-center bg-primary/5">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="font-serif text-3xl text-white mb-4">Royal Order Confirmed</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          Your exquisite selection from Ejidezee Gold International is being prepared. A concierge will contact you shortly for shipping details.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => setLocation('/')}
            className="w-full bg-primary text-black hover:bg-primary/90 rounded-none h-12 uppercase tracking-widest text-xs font-bold"
          >
            Continue Shopping <ShoppingBag className="ml-2 w-4 h-4" />
          </Button>

          <button
            onClick={() => setLocation('/collections')}
            className="text-white/40 hover:text-white text-xs uppercase tracking-tighter transition-colors underline underline-offset-4"
          >
            View My Collections
          </button>
        </div>
      </motion.div>
    </div>
  );
};