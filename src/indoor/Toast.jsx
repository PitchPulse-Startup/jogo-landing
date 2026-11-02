// src/indoor/Toast.jsx — says an action worked. An answered request leaves the
// list right away, so without this the card would just vanish.
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

const EVENT = 'jogo-indoor-toast';

/** toast('Approved', 'Marcus has been told.') from anywhere on the portal. */
export const toast = (title, sub) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { title, sub, id: Date.now() } }));

export default function Toaster() {
  const [item, setItem] = useState(null);
  useEffect(() => {
    const show = (e) => setItem(e.detail);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);
  useEffect(() => {
    if (!item) return undefined;
    const t = setTimeout(() => setItem(null), 4500);
    return () => clearTimeout(t);
  }, [item]);
  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
      <AnimatePresence>
        {item ? (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto bg-[#0B0D10] text-white rounded-2xl pl-3.5 pr-5 py-3 flex items-center gap-3 shadow-2xl max-w-md"
          >
            <span className="w-9 h-9 rounded-full bg-[#4ADE80] text-[#0B0D10] inline-flex items-center justify-center shrink-0"><Check size={20} strokeWidth={3} /></span>
            <span className="min-w-0">
              <span className="block font-extrabold leading-tight">{item.title}</span>
              {item.sub ? <span className="block text-sm font-semibold text-white/70 leading-snug mt-0.5">{item.sub}</span> : null}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
