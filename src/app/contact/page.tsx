"use client";

import React from 'react';
import { Mail, MessageSquare, Send, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const contactLinks = [
        {
            title: "Join Telegram Channel",
            description: "Get daily updates, study material and exam notifications.",
            icon: <Send className="w-6 h-6 text-indigo-500" />,
            link: "https://t.me/MPPSC2026_Mission",
            label: "t.me/MPPSC2026_Mission",
            color: "indigo"
        },
        {
            title: "Contact Support Bot",
            description: "For payment issues, technical help or account queries.",
            icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
            link: "https://t.me/mppss_26_bot",
            label: "@mppss_26_bot",
            color: "emerald"
        },
        {
            title: "Email Support",
            description: "Official inquiries and detailed support requests.",
            icon: <Mail className="w-6 h-6 text-amber-500" />,
            link: "mailto:support@mppsc2026.com",
            label: "support@mppsc2026.com",
            color: "amber"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        Support & Guidance
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        We're Here to Help Your <span className="text-indigo-600">Preparation.</span>
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        Whether you have a technical issue or need guidance for your MPPSC 2026 journey, our team is just a click away.
                    </p>
                </div>
            </div>

            {/* Contact Options Grid */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {contactLinks.map((contact, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 group overflow-hidden relative">
                                <CardContent className="p-8 flex flex-col h-full">
                                    <div className={`w-14 h-14 rounded-2xl bg-${contact.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                        {contact.icon}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{contact.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                                        {contact.description}
                                    </p>

                                    <Button 
                                        asChild 
                                        variant="outline" 
                                        className="w-full h-11 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-bold group/btn"
                                    >
                                        <a href={contact.link} target="_blank" rel="noopener noreferrer">
                                            {contact.label}
                                            <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info / Mission */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden text-center"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold font-display">Mission MPPSC 2026</h2>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            Our goal is to provide state-of-the-art digital tools and guidance to every aspirant, ensuring that language or access to premium content never becomes a barrier to success.
                        </p>
                        <div className="flex items-center justify-center gap-6 pt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-indigo-400">24/7</div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Bot Support</div>
                            </div>
                            <div className="w-px h-10 bg-slate-800" />
                            <div className="text-center">
                                <div className="text-2xl font-bold text-violet-400">100%</div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Privacy</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer space */}
            <div className="h-20" />
        </div>
    );
}
