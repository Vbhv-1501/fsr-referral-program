'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ_DATA } from '@/lib/config';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="landing-section" style={{ background: '#FAF7F7' }}>
      <div className="section-shell-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-label block mb-3">FAQ</span>
          <h2 className="section-title">Common Questions</h2>
        </motion.div>

        <div className="space-y-3">
          {FAQ_DATA.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`faq-item ${open === i ? 'open' : ''}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className={`font-semibold text-sm sm:text-base transition-colors ${
                  open === i ? 'text-[#A85656]' : 'text-[#181414]'
                }`}>
                  {item.q}
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all ${
                  open === i
                    ? 'bg-[#C85A5A] text-[#181414]'
                    : 'bg-[#F1EAEA] text-[#888]'
                }`}>
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <div className="px-6 pb-5 text-sm text-[#666] leading-relaxed border-t border-black/[0.05] pt-4">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



