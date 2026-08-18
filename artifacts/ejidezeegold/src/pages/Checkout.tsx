import React, { useState, useEffect } from 'react';
import { useCart, gramsToAED } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { useLocation } from 'wouter';
import { Loader2, CreditCard, ShieldCheck, AlertTriangle, Mail, MapPin } from 'lucide-react';

export const Checkout = () => {
  const {
    subtotal,
    subtotalInUSD,
    formatPrice,
    cart,
    currency,
    goldPricePerGramAED,
  } = useCart();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [method, setMethod] = useState<'card' | 'paypal'>('paypal'); // default to the live method

  // --- BUYER INFO STATE ---
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  // --- DELIVERY ADDRESS STATE (Ejidezee is delivery-only, no pickup option) ---
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressCountry, setAddressCountry] = useState('');

  const currencyMismatch = false;

  // --- LOAD FLUTTERWAVE SCRIPT ON MOUNT ---
  // NOTE: Flutterwave is currently under construction (see disabled state below).
  // Script is still preloaded so it's ready the moment it's switched on.
  useEffect(() => {
    // @ts-ignore
    if (window.FlutterwaveCheckout) return;
    if (document.querySelector('script[src*="checkout.flutterwave.com"]')) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const deliveryAddress = () =>
    [buyerName, addressLine1, addressLine2, addressCity, addressCountry]
      .filter(Boolean)
      .join('\n');

  // --- FLUTTERWAVE HANDLER (not yet live — kept intact for when it's ready) ---
  const handleFlutterwavePayment = () => {
    // @ts-ignore
    if (!window.FlutterwaveCheckout) {
      alert('Payment is still loading. Please try again in a moment.');
      setIsProcessing(false);
      return;
    }

    const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) {
      alert('Flutterwave public key is missing. Please contact support.');
      setIsProcessing(false);
      return;
    }

    const txRef = `EJIDEZEE-${Date.now()}`;

    try {
      // @ts-ignore
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: txRef,
        amount: subtotal,
        currency: currency, // 'AED' | 'USD' | 'NGN' — Flutterwave supports all three directly
        payment_options: 'card, mobilemoneyghana, ussd',
        customer: {
          email: buyerEmail,
          phone_number: buyerPhone,
          name: buyerName,
        },
        meta: {
          payment_source: 'Ejidezee Gold Web',
          delivery_address: deliveryAddress().replace(/\n/g, ', '),
          items_ordered: cart.map((item) => `${item.product.name} x${item.quantity}`).join(', '),
        },
        customizations: {
          title: 'Ejidezee Gold International',
          description: 'Payment for jewelry order',
        },
        callback: function (response: any) {
          console.log('response', response);
          if (response.status === 'successful' || response.status === 'completed') {
            fetch('/.netlify/functions/flutterwave-notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference: response.transaction_id || txRef,
                buyerName,
                buyerEmail,
                buyerPhone,
                deliveryAddress: {
                  line1: addressLine1,
                  line2: addressLine2,
                  city: addressCity,
                  country: addressCountry,
                },
                currency,
                items: cart.map((item) => ({
  name: item.product.name,
  quantity: item.quantity,
  price: formatPrice(gramsToAED(item.product.weightInGrams ?? 0, goldPricePerGramAED)),
})),
              }),
            })
              .then(() => {
                setIsProcessing(false);
                setLocation('/success');
              })
              .catch((err) => {
                console.error('Failed to send notification:', err);
                setIsProcessing(false);
                setLocation('/success');
              });
          } else {
            alert('Payment failed or was cancelled. Please try again.');
            setIsProcessing(false);
          }
        },
        onclose: function () {
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error('Flutterwave setup error:', err);
      alert('Payment window failed to open. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Flutterwave is under construction — block submission entirely if selected.
    if (method === 'card') {
      return;
    }

    // Every order is delivery — always confirm the additional-fee notice before proceeding.
    const ok = window.confirm(
      'Please note: An additional delivery fee will be communicated to you separately and paid later, after your order is confirmed. Do you want to continue?'
    );
    if (!ok) return;

    setIsProcessing(true);

    if (method === 'paypal') {
      sessionStorage.setItem('pendingOrder', JSON.stringify({
        buyerName,
        buyerEmail,
        buyerPhone,
        deliveryAddress: {
          line1: addressLine1,
          line2: addressLine2,
          city: addressCity,
          country: addressCountry,
        },
        currency,
        items: cart.map((item) => ({
  name: item.product.name,
  quantity: item.quantity,
  price: formatPrice(gramsToAED(item.product.weightInGrams ?? 0, goldPricePerGramAED)),
})),
      }));

      const usdAmount = subtotalInUSD.toFixed(2);
      const EJIDEZEE_PAYPAL_EMAIL = 'Mustaphazainabomolara828@gmail.com';
      window.location.href = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${EJIDEZEE_PAYPAL_EMAIL}&amount=${usdAmount}&currency_code=USD&item_name=Ejidezee+Gold+Boutique+Order&no_shipping=1&return=https://ejidezee-gold-international.netlify.app/success&cancel_return=https://ejidezee-gold-international.netlify.app/checkout`;
    } else {
      handleFlutterwavePayment();
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl border border-white/10 bg-[#0a0a0a] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

        <header className="mb-10 text-center">
          <h1 className="font-serif text-3xl text-white mb-2 tracking-tight">Checkout</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-[0.3em]">Ejidezee Gold International Security</p>
        </header>

        <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
          <span className="text-white/60 uppercase tracking-widest text-xs font-semibold">Total Amount</span>
          <span className="text-primary font-serif text-3xl">{formatPrice(subtotal)}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* BUYER INFO FIELDS */}
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Amara Johnson"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Email Address</label>
              <input
                type="email"
                placeholder="e.g. amara@email.com"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-[0.2em] block mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {/* DELIVERY ADDRESS (Ejidezee is delivery-only — no pickup option) */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Delivery Address
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street address"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input
                type="text"
                placeholder="Apartment, area, landmark (optional)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={addressCountry}
                  onChange={(e) => setAddressCountry(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* DELIVERY FEE NOTICE */}
            <div className="mt-3 border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-white/70 text-xs leading-relaxed">
                An additional <span className="text-yellow-300 font-bold">delivery fee</span> may apply and will be
                communicated to you separately and paid <span className="text-yellow-300 font-bold">later</span>,
                after your order is confirmed.
              </p>
            </div>

            {/* EMAIL CONFIRMATION NOTICE */}
            <div className="mt-3 border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-white/70 text-xs leading-relaxed">
                A copy of your delivery details will be sent to{' '}
                <span className="text-primary font-bold">
                  {buyerEmail || 'your email address'}
                </span>{' '}
                once payment is confirmed.
              </p>
            </div>
          </div>

          {/* PAYMENT METHOD SELECTION */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`relative flex flex-col items-center p-4 border transition-all ${method === 'card' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}
            >
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[8px] font-bold uppercase tracking-wide px-2 py-0.5">
                Coming Soon
              </span>
              <CreditCard className={`w-5 h-5 mb-2 ${method === 'card' ? 'text-primary' : 'text-white'}`} />
              <span className="text-[10px] uppercase tracking-widest text-white font-bold">Card / Flutterwave</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('paypal')}
              className={`flex flex-col items-center p-4 border transition-all ${method === 'paypal' ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 opacity-30 hover:opacity-100'}`}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 mb-2" />
              <span className="text-[10px] uppercase tracking-widest text-white font-bold">PayPal</span>
            </button>
          </div>

          <div className="py-12 border border-dashed border-white/10 bg-white/5 text-center px-6">
            <p className="text-white/70 text-sm leading-relaxed">
              {method === 'card' ? (
                <>Flutterwave payments are <span className="text-yellow-400 font-bold uppercase">coming soon</span>. Please select PayPal to complete your order for now.</>
              ) : (
                <>You will be redirected to the secure <span className="text-primary font-bold uppercase">PayPal</span> portal to finalize your order.</>
              )}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || method === 'card'}
            className="w-full bg-primary text-black hover:bg-primary/90 rounded-none h-14 uppercase tracking-[0.2em] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin mr-2" />
            ) : method === 'card' ? (
              'Currently Unavailable'
            ) : (
              `Proceed to Payment`
            )}
          </Button>
        </form>

        <footer className="mt-12 flex items-center justify-center gap-2 text-white/20 text-[9px] uppercase tracking-[0.3em]">
          <ShieldCheck className="w-3 h-3 text-primary/50" /> Secure SSL Encrypted Gateway
        </footer>
      </div>
    </div>
  );
};