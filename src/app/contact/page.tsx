'use client';

import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { ContactForm } from "@/components/ContactForm";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { useSettingsStore } from "@/store/useSettingsStore";
export const contactEmail = "mppsc@zenscroll.app";
export default function ContactPage() {

    const { language } = useSettingsStore();

    const text = {
        en: {
            title: "Get in Touch",
            subtitle: "We'd love to hear from you. Whether you have a question about features, pricing, or just want to say hi, our team is ready to answer all your questions.",
            contactInfo: "Contact Information",
            email: "Email",
            messageTitle: "Send us a message"
        },
        hi: {
            title: "संपर्क करें",
            subtitle: "हम आपसे सुनना चाहेंगे। चाहे आपके पास किसी फीचर, शुल्क को लेकर कोई प्रश्न हो या आप बस 'नमस्ते' कहना चाहते हों, हमारी टीम आपकी सहायता के लिए तैयार है।",
            contactInfo: "संपर्क जानकारी",
            email: "ईमेल",
            messageTitle: "हमें संदेश भेजें"
        }
    };

    const t = language === 'hi' ? text.hi : text.en;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
             <AppNavbar user={null} />
             <div className="pt-32 pb-20">
                 <div className="max-w-6xl mx-auto px-4 lg:px-8">
                
                <div className="text-center mb-16 space-y-4">
                     <h1 className="text-4xl md:text-5xl font-black font-display text-slate-900 tracking-tight">
                        {t.title}
                     </h1>
                     <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        {t.subtitle}
                     </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    
                    {/* Contact Info */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                                <h3 className="font-bold text-xl text-slate-900">{t.contactInfo}</h3>
                                
                                <div className="space-y-4">
                                     <div className="flex items-start gap-4">
                                         <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                             <Mail size={18} />
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-900">{t.email}</p>
                                             <p className="text-slate-500 text-sm">mppscsyllabus@gmail.com</p>
                                         </div>
                                     </div>

                                     <div className="flex items-start gap-4">
                                         <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                             <Phone size={18} />
                                         </div>
                                         <div>
                                             <p className="font-bold text-slate-900">{language === 'hi' ? 'फ़ोन' : 'Phone'}</p>
                                             <p className="text-slate-500 text-sm">+91 8766451748</p>
                                         </div>
                                     </div>
                                </div>
                          </div>
                    </motion.div>

                    {/* Contact Form */}
                     <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                     >
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100">
                             <h2 className="text-2xl font-bold font-display mb-6">{t.messageTitle}</h2>
                             <ContactForm />
                        </div>
                     </motion.div>
                </div>
                </div>
             </div>
        </div>
    );
}
                 
