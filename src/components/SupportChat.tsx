'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, X, Send, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { submitSupportTicket } from '@/actions/support-actions';
import Link from 'next/link';

type QA = {
  question: { en: string; hi: string };
  answer: { en: React.ReactNode; hi: React.ReactNode };
};

const FAQS: QA[] = [
  {
    question: { en: 'How do I get Pro access?', hi: 'Pro एक्सेस कैसे मिलेगा?' },
    answer: {
      en: (
        <span>
          You can get instant Pro access by completing your payment directly from our{' '}
          <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">
            Pricing page
          </Link>
          . If you face any issues, our support team is always here to help!
        </span>
      ),
      hi: (
        <span>
          आप हमारे{' '}
          <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">
            प्राइसिंग पेज
          </Link>{' '}
          से सीधा पेमेंट करके प्रो एक्सेस ले सकते हैं। आपका प्लान तुरंत एक्टिव हो जाएगा।
        </span>
      ),
    },
  },
  {
    question: {
      en: 'Do you provide traditional bookish textbook notes?',
      hi: 'क्या आप इसमें पारंपरिक टेक्स्टबुक नोट्स भी देते हैं?',
    },
    answer: {
      en: 'No. We do NOT provide boring, bulky textbook notes to memorize. The MP Police exam is not cleared by just collecting piles of notes! We eliminate the hassle of checking 10 different PDFs just to navigate the syllabus. Instead, we offer complete conceptual clarity, topic-wise practice, and smart one-liners.',
      hi: 'नहीं! हम रटने वाली पारंपरिक और भारी-भरकम पीडीएफ नोट्स नहीं देते हैं। सिर्फ नोट्स जमा करने से MP Police परीक्षा क्लियर नहीं होती! यहां आपको 10 अलग-अलग PDFs देखने के झंझट से मुक्ति मिलती है। हम आपको पूरे सिलेबस के अनुसार विषय-वार अभ्यास और स्मार्ट वन-लाइनर्स प्रदान करते हैं।',
    },
  },
  {
    question: {
      en: 'How is the content and PYQs structured?',
      hi: 'कंटेंट और PYQs कैसे व्यवस्थित हैं?',
    },
    answer: {
      en: 'Our modules are systematically organized in a highly structured layout: Subject-wise (GK, Science, Math, Reasoning) and Topic-wise. Every single question has detailed explanations, analytics, and bilingual retention mnemonics.',
      hi: 'हमारा कंटेंट पूरी तरह से व्यवस्थित है: विषय-वार (GK, विज्ञान, गणित, रीज़निंग) और टॉपिक-वार। हर प्रश्न के साथ आपको मिलेगी स्मार्ट व्याख्या, याद रखने के लिए आसान मेमोनिक्स और सुधारात्मक एनालिटिक्स।',
    },
  },
  {
    question: {
      en: 'What exactly do we get in the Pro module?',
      hi: 'प्रो (Pro) मॉड्यूल में वास्तव में क्या-क्या मिलेगा?',
    },
    answer: {
      en: 'You get entire syllabus coverage topic-by-topic. Every section features extensive question banks, smart explanations (in both Hindi & English), and our MPGK Smart Vault with PYQs and memory tricks to ensure maximum score.',
      hi: 'प्रो मॉड्यूल में आपको पूरे सिलेबस की गहरी समझ मिलती है। हर सेक्शन में विशाल प्रश्न बैंक, स्मार्ट व्याख्या (हिंदी और अंग्रेजी दोनों में) और हमारा MPGK स्मार्ट वॉल्ट मिलता है, जिसमें अधिकतम स्कोर सुनिश्चित करने के लिए PYQs और मेमोरी ट्रिक्स शामिल हैं।',
    },
  },
  {
    question: {
      en: 'What if my access expires or exam gets delayed?',
      hi: 'अगर एक्सेस समाप्त हो जाए या परीक्षा देरी से हो?',
    },
    answer: {
      en: 'If the exam is delayed, we extend your access with no extra charge. Your strategic preparation is fully covered!',
      hi: 'अगर परीक्षा में देरी होती है, तो हम आपका एक्सेस बढ़ा देंगे — कोई अतिरिक्त शुल्क नहीं। आपकी तैयारी की सुरक्षा हमारी ज़िम्मेदारी है!',
    },
  },
];

export function SupportChat() {
  const user = useSettingsStore((state) => state.user);
  const language = useSettingsStore((state) => state.language);
  const hi = language === 'hi';
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'faq'>('chat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);

  useEffect(() => {
    if (isNudgeOpen) {
      const timer = setTimeout(() => {
        setIsNudgeOpen(false);
      }, 5000); // Auto-dismiss nudge after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isNudgeOpen]);

  const dynamicFaqs = FAQS;

  /**
   * Enterprise-grade user name detection with multiple fallback strategies
   * Priority: Guest localStorage > Authenticated User > Default
   *
   * @returns Sanitized user name or default greeting
   */
  const getUserDisplayName = React.useCallback((): string => {
    try {
      // Strategy 1: Check localStorage for guest name (from quiz)
      // This is set when guest users take tests
      if (typeof window !== 'undefined') {
        const guestName = localStorage.getItem('mppolice_guest_name');
        if (guestName && guestName.trim()) {
          // Sanitize and validate
          const sanitized = guestName.trim().slice(0, 50); // Max 50 chars
          if (sanitized.length > 0) {
            return sanitized;
          }
        }
      }

      // Strategy 2: Check authenticated user from store
      // This comes from NextAuth session
      if (user?.name && typeof user.name === 'string') {
        const sanitized = user.name.trim().slice(0, 50);
        if (sanitized.length > 0) {
          return sanitized;
        }
      }

      // Strategy 3: Fallback to default
      return 'there';
    } catch (error) {
      // Fail gracefully - never crash the UI
      console.error('[SupportChat] Error getting user name:', error);
      return 'there';
    }
  }, [user?.name]);

  // Get display name once on mount and when user changes
  // Memoize to prevent unnecessary re-renders
  const displayName = React.useMemo(() => getUserDisplayName(), [user?.name, getUserDisplayName]);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });
  const [isSubmitting] = useState(false);
  
  // 🎯 Detect exam context
  const isProUser = user?.planTier === 'pro';
  
  // Determine support category based on context
  const getSupportCategory = (): 'premium' | 'general' => {
    if (isProUser) return 'premium';
    return 'general';
  };
  
  // Show on all pages except quiz/test pages to reduce clutter during exams
  if (pathname.includes('/quiz') || pathname.includes('/test')) return null;

  const handleWhatsApp = () => {
    const message = 'Hi, I need help with the MP Police App. My query is:';
    const waNumber = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER || '917489388350';
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleTelegram = () => {
    const botUsername = process.env.NEXT_PUBLIC_SUPPORT_TELEGRAM_BOT_USERNAME || 'mppolice_human_chat_bot';
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // 🚀 INSTANT UI FEEDBACK
    // Bhai, user ko lagega kaam ho gaya, logic background mein chalti rahegi.
    setIsOpen(false);
    toast.success("Message sent! We'll get back to you shortly.");
    
    // Exact path at the time of click
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;

    try {
      // Non-blocking background call
      submitSupportTicket({
        ...formData,
        userId: user?.id || null,
        category: getSupportCategory(),
        pagePath: currentPath,
      }).catch(err => {
        console.error('Background support submission failed', err);
      });
      
      setFormData({ ...formData, message: '' });
    } catch (_error) {
      // Construction failed
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Overlay - Prevents background clicks and closes chat */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[99] bg-black/20 backdrop-blur-[2px]"
              aria-hidden="true"
            />

            {/* Chat Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed right-6 bottom-24 z-[100] flex max-h-[600px] w-[90vw] max-w-[380px] flex-col overflow-hidden overscroll-y-none rounded-2xl border border-indigo-100 bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#00F0FF] to-[#00D1E0] p-6 text-slate-900">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <MessageCircle size={100} />
                </div>
                <h3 className="relative z-10 mb-1 font-sans text-xl font-bold text-slate-900">
                  {hi ? 'नमस्ते' : 'Hello'}
                  {displayName !== 'there' ? `, ${displayName}` : ''}! 👋
                </h3>
                <p className="relative z-10 text-sm font-medium text-slate-700">
                  {hi
                    ? 'हम आमतौर पर कुछ ही घंटों में जवाब देते हैं।'
                    : 'We usually reply within a few hours.'}
                </p>

                <div className="relative z-10 mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                      'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'chat'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white/30 text-slate-800 backdrop-blur-sm hover:bg-white/50'
                    )}
                  >
                    Contact Us
                  </button>
                  <button
                    onClick={() => setActiveTab('faq')}
                    className={cn(
                      'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                      activeTab === 'faq'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white/30 text-slate-800 backdrop-blur-sm hover:bg-white/50'
                    )}
                  >
                    FAQs
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {activeTab === 'chat' ? (
                  <div className="space-y-6 p-5">
                    {/* Quick Connect */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleWhatsApp}
                        className="group flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50/80 p-3 transition-colors hover:bg-green-100"
                      >
                        <Phone className="mb-1 h-6 w-6 text-green-600 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-semibold text-green-800">WhatsApp</span>
                      </button>
                      <button
                        onClick={handleTelegram}
                        className="group flex flex-col items-center justify-center rounded-xl border border-sky-200 bg-sky-50/80 p-3 transition-colors hover:bg-sky-100"
                      >
                        <Send className="mb-1 h-6 w-6 text-sky-600 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-semibold text-sky-800">Telegram</span>
                      </button>
                    </div>

                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-slate-200"></div>
                      <span className="mx-4 flex-shrink-0 text-xs font-medium text-slate-400">
                        OR SEND A MESSAGE
                      </span>
                      <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                            placeholder="+91..."
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600">Message</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          rows={3}
                          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
                          placeholder="How can we help you?"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <>
                            <Send size={16} />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    <p className="mb-2 px-1 text-xs font-medium text-slate-500">Common Questions</p>
                    {dynamicFaqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="flex w-full items-center justify-between p-3 text-left"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {hi ? faq.question.hi : faq.question.en}
                          </span>
                          {expandedFaq === idx ? (
                            <ChevronUp size={16} className="ml-2 flex-shrink-0 text-indigo-600" />
                          ) : (
                            <ChevronDown size={16} className="ml-2 flex-shrink-0 text-slate-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFaq === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-slate-100 bg-slate-50/50 p-3 pt-0 text-sm text-slate-600">
                                {hi ? faq.answer.hi : faq.answer.en}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}

                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-center">
                      <p className="mb-2 text-sm font-medium text-indigo-900">
                        {hi ? 'और सवाल हैं?' : 'Still have questions?'}
                      </p>
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
                      >
                        {hi ? 'सपोर्ट से बात करें' : 'Chat with Support'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed right-6 bottom-6 z-[100] flex flex-col items-end gap-3">
        {/* Hover Nudge - Visual Lead Gen */}
        <AnimatePresence>
          {!isOpen && isNudgeOpen && (
            <motion.div
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="mr-1 mb-1 flex origin-bottom-right items-center gap-3 rounded-2xl border border-amber-500/30 bg-[#060a12]/95 px-4 py-3.5 shadow-2xl backdrop-blur-md text-white ring-1 ring-white/5"
            >
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500"></span>
              </div>
              <div>
                <p className="text-sm leading-tight font-black text-white">
                  {hi ? 'मदद चाहिए?' : 'Need Help?'}
                </p>
                <p className="text-[11px] font-semibold whitespace-nowrap text-slate-400 mt-0.5">
                  {hi ? 'सपोर्ट टीम से बात करें' : 'Chat with support team'}
                </p>
              </div>

              {/* Close Button for Nudge */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNudgeOpen(false);
                }}
                className="ml-2 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onMouseEnter={() => !isOpen} // Just for interaction tracking if needed
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group relative flex h-14 w-14 items-center justify-center rounded-full border-3 border-slate-950 bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:scale-110 active:scale-95',
            isOpen ? 'rotate-90 bg-slate-800' : 'hover:shadow-[0_0_30px_rgba(245,158,11,0.45)]'
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
          )}

          {/* Ping animation when closed */}
          {!isOpen && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-950 bg-red-500" />
          )}

          {/* Golden Ring Pulse when closed */}
          {!isOpen && (
            <span className="absolute inset-0 -z-10 rounded-full bg-amber-500/10 animate-ping" />
          )}
        </button>
      </div>
    </>
  );
}
