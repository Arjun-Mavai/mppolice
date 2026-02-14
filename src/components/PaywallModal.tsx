'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Sparkles, Check } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal = ({ isOpen, onClose }: PaywallModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            // onClick={onClose} // Disabled closing on backdrop click
            className="absolute inset-0 bg-black backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-center text-white">
              <div className="absolute top-0 left-0 h-full w-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="mb-4 inline-flex rounded-full bg-white/20 p-4 backdrop-blur-sm"
              >
                <Lock size={32} className="text-white" />
              </motion.div>
              <h2 className="font-display relative z-10 mb-2 text-2xl font-bold">
                Unlock Inner Peace
              </h2>
              <p className="relative z-10 text-sm text-indigo-100">
                You&apos;ve reached your daily free limit.
              </p>
            </div>

            <div className="space-y-6 p-8">
              <div className="space-y-4">
                <Benefit icon={Sparkles} text="Unlimited Swipes" />
                <Benefit icon={Check} text="Save Unlimited Quotes" />
                <Benefit icon={Check} text="Unlock All Categories" />
                <Benefit icon={Check} text="Exclusive Zen Themes" />
              </div>

              <button
                onClick={() => {
                  // Redirect to secure backend endpoint
                  window.location.href = '/api/payment/checkout';
                }}
                className="group flex w-full transform items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-gray-800 active:scale-95"
              >
                <span>Upgrade for $3.99/mo</span>
                <Sparkles size={18} className="transition-colors group-hover:text-yellow-400" />
              </button>

              {/* Removed "Maybe later" button to enforce paywall */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Benefit = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-3 text-gray-600">
    <div className="rounded-full bg-green-100 p-1.5 text-green-600">
      <Icon size={14} strokeWidth={3} />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);
