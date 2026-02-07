"use client";

import React, { useState,   } from "react";
import { 
  MessageCircle, 
  X, 
  Send, 
  Phone, 
  ChevronDown, 
  ChevronUp,
   
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { submitSupportTicket } from "@/actions/support-actions";

type QA = {
  question: string;
  answer: string;
};

const FAQS: QA[] = [
  {
    question: "Do you provide notes in both languages?",
    answer: "Yes! All our content is available in both Hindi & English with a seamless toggle.",
  },
  {
    question: "Is this helpful for MPPSC Pre & Mains?",
    answer: "Absolutely. Our Mnemonics and detailed syllabus coverage are designed for comprehensive preparation.",
  },
  {
    question: "Can I access it on multiple devices?",
    answer: "Yes, your progress syncs across your devices via your secure login.",
  },
];

export function SupportChat() {
  const user = useSettingsStore((state) => state.user);
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "faq">("chat");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isNudgeOpen, setIsNudgeOpen] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  if(user && pathname !== "/") return null;
  // Hide on Quiz Play for focus
  if (pathname === "/syllabus/quiz/play" ) return null;

  const handleWhatsApp = () => {
    const message = "Hi, I need help with the MPPSC App. My query is:";
    window.open(`https://wa.me/918766451748?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleTelegram = () => {
     window.open("https://t.me/mppss_26_bot", "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitSupportTicket({
        ...formData,
        userId: user?.id || null,
        category: "general"
      });

      if (result.success) {
        toast.success("Message sent! We'll get back to you shortly.");
        setFormData({ ...formData, message: "" });
        setIsOpen(false);
      } else {
        toast.error("Something went wrong. Try WhatsApp instead.");
      }
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 overscroll-y-none right-6 z-[100] w-[90vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MessageCircle size={100} />
              </div>
              <h3 className="text-xl font-bold font-serif mb-1 relative z-10">Hello! 👋</h3>
              <p className="text-indigo-100 text-sm relative z-10">
                We usually reply within a few minutes.
              </p>
              
              <div className="flex gap-2 mt-4 relative z-10">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all",
                    activeTab === "chat" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "bg-indigo-700/50 text-indigo-100 hover:bg-indigo-700/70"
                  )}
                >
                  Contact Us
                </button>
                <button
                  onClick={() => setActiveTab("faq")}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-all",
                    activeTab === "faq" 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "bg-indigo-700/50 text-indigo-100 hover:bg-indigo-700/70"
                  )}
                >
                  FAQs
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {activeTab === "chat" ? (
                <div className="p-5 space-y-6">
                  {/* Quick Connect */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleWhatsApp}
                      className="flex flex-col items-center justify-center p-3 bg-green-50/80 border border-green-200 rounded-xl hover:bg-green-100 transition-colors group"
                    >
                      <Phone className="w-6 h-6 text-green-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-green-800">WhatsApp</span>
                    </button>
                    <button
                      onClick={handleTelegram}
                      className="flex flex-col items-center justify-center p-3 bg-sky-50/80 border border-sky-200 rounded-xl hover:bg-sky-100 transition-colors group"
                    >
                      <Send className="w-6 h-6 text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-semibold text-sky-800">Telegram</span>
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">OR SEND A MESSAGE</span>
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
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white"
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
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-600">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white"
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
                        className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <div className="p-4 space-y-2">
                    <p className="text-xs text-slate-500 font-medium px-1 mb-2">Common Questions</p>
                  {FAQS.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-3 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-700">{faq.question}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp size={16} className="text-indigo-600 flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 pt-0 text-sm text-slate-600 bg-slate-50/50 border-t border-slate-100">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                    <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center border border-indigo-100">
                        <p className="text-sm text-indigo-900 font-medium mb-2">Still have questions?</p>
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className="bg-white text-indigo-600 text-xs font-bold py-2 px-4 rounded-full border border-indigo-200 hover:bg-indigo-50 transition-colors"
                        >
                            Chat with Support
                        </button>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        {/* Hover Nudge - Visual Lead Gen */}
        <AnimatePresence>
          {!isOpen && isNudgeOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.9 }}
               className="bg-white px-4 py-3 rounded-xl shadow-xl border border-indigo-100 hidden md:flex items-center gap-3 origin-bottom-right mb-1 mr-1"
             >
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">Need Help?</p>
                    <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Chat with our support team</p>
                </div>
                
                {/* Close Button for Nudge */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        // We rely on the parent logic or just let user click the main button
                        // Ideally we would have a separate state to dismiss JUST the nudge, 
                        // but user said "click ke baad hat jaaye" (main button click).
                        // Adding a visual distinct close just in case, but functionally 
                        // clicking the main button is the primary dismissal.
                        setIsNudgeOpen(false);
                    }} 
                    className="ml-2 p-1 hover:bg-slate-100 rounded-full text-slate-400"
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
            "w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 border-4 border-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center group relative",
            isOpen && "rotate-90 bg-slate-800 border-slate-700"
            )}
        >
            {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />}
            
            {/* Ping animation when closed */}
            {!isOpen && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
        </button>
      </div>
    </>
  );
}
