import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [method, setMethod] = useState<'email' | 'whatsapp' | null>(null);

  // TODO: VENDOR_EMAIL and the address below are lorem-ipsum placeholders — replace with real details.
  const VENDOR_EMAIL = 'Mustaphazainabomolara828@gmail.com';
  const VENDOR_WHATSAPP = '971528828956';

  const validate = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert('Please fill in all fields before sending.');
      return false;
    }
    return true;
  };

  const handleSend = (type: 'email' | 'whatsapp') => {
    if (!validate()) return;

    let url = '';

    if (type === 'email') {
      const subject = encodeURIComponent(`Inquiry from ${name} - Ejidezee Gold International`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      url = `mailto:${VENDOR_EMAIL}?subject=${subject}&body=${body}`;
    } else {
      const text = encodeURIComponent(`Hello Ejidezee Gold International,\n\nMy name is ${name} (${email}).\n\n${message}`);
      url = `https://wa.me/${VENDOR_WHATSAPP}?text=${text}`;
    }

    window.location.href = url;

    setMethod(type);
    setShowSuccess(true);

    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left Side: Info */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-8">Private Viewing</h1>
          <p className="text-white/60 leading-relaxed mb-12">
            We welcome discerning clients to experience the Ejidezee Gold International collection in person.
          </p>
          <div className="space-y-8 text-sm tracking-wider uppercase">
            <div>
              {/* TODO: placeholder address — replace with the real showroom location */}
              <p className="text-primary mb-2">Boutique</p>
              <p className="text-white/80">Lorem Ipsum Street<br />Dolor District, Sit Amet City</p>
            </div>
            <div>
              <p className="text-primary mb-2">Concierge</p>
              <p className="text-white/80">+971 52 882 8956<br />{VENDOR_EMAIL}</p>
            </div>
            <div>
              <p className="text-primary mb-2">Hours</p>
              <p className="text-white/80">Mon - Sat: 10:00 - 22:00<br />Sun: By Appointment</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/5 p-8 md:p-12 border border-white/10"
        >
          <h2 className="font-serif text-2xl text-white mb-8">Send an Inquiry</h2>
          <div className="space-y-6">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Your Message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-transparent border-b border-white/20 py-3 text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSend('email')}
                className="bg-primary text-black hover:bg-white transition-colors py-4 uppercase tracking-widest text-xs font-bold"
              >
                Send via Email
              </button>

              <button
                type="button"
                onClick={() => handleSend('whatsapp')}
                className="bg-[#25D366] text-white hover:bg-[#1ebe57] transition-colors py-4 uppercase tracking-widest text-xs font-bold"
              >
                Send via WhatsApp
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0a0a] border border-white/10 p-10 max-w-sm w-full text-center relative shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <button
                onClick={() => setShowSuccess(false)}
                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center bg-primary/5">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="font-serif text-2xl text-white mb-3">Inquiry Sent</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Your message has been initiated via{' '}
                <span className="text-primary font-semibold capitalize">{method}</span>.
                Please complete the send in your app.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-primary text-black hover:bg-primary/90 py-3 uppercase tracking-widest text-xs font-bold transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}