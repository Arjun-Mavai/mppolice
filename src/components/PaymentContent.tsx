"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Mail, Copy, CheckCircle2, Download, Quote, Sparkles, ShieldCheck, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ExitSurveyModal } from "./ExitSurveyModal"
import { contactEmail } from "@/app/contact/page"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [emailCopied, setEmailCopied] = useState(false)
  const [currency, setCurrency] = useState<"INR" | "USD">("INR")
  const queryAmount = searchParams.get('amount');
  const [amount, setAmount] = useState(queryAmount || "99")

  useEffect(() => {
      if (queryAmount) {
          setAmount(queryAmount);
      }
  }, [queryAmount]);

  const currencySymbol = currency === "INR" ? "₹" : "$"
  const displayAmount = `${currencySymbol}${amount}`
  const planName = amount === "299" ? "Premium Yearly Plan" : (amount === "199" ? "Upgrade to Pro" : "Basic Yearly Plan")
  // Calculate original price 
  const originalAmount = amount === "299" ? `${currencySymbol}799` : (amount === "199" ? `${currencySymbol}499` : `${currencySymbol}299`)
  const discount = amount === "299" ? "63% OFF" : (amount === "199" ? "60% OFF" : "67% OFF")

  // Back Navigation Interception
  const [showExitModal, setShowExitModal] = useState(false)
  const isSurveyCompleted = typeof window !== 'undefined' ? localStorage.getItem('payment_exit_survey_completed') : null;
  const handlePopStateRef = useRef<((event: PopStateEvent) => void) | null>(null);

  useEffect(() => {
    // If already surveyed, no need to intercept
    if (isSurveyCompleted) return;

    // Push state to detect back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event: PopStateEvent) => {
       // Check FRESH value from localStorage (in case it changed)
       const currentStatus = localStorage.getItem('payment_exit_survey_completed');
       
       if (!currentStatus) {
          // Prevent back, show modal
          window.history.pushState(null, '', window.location.href);
          setShowExitModal(true);
       } 
    };

    handlePopStateRef.current = handlePopState;
    window.addEventListener('popstate', handlePopState);

    return () => {
        window.removeEventListener('popstate', handlePopState);
    };
  }, [isSurveyCompleted]);

  const handleConfirmExit = () => {
      setShowExitModal(false);
      localStorage.setItem('payment_exit_survey_completed', 'true'); 
      
      // Remove listener immediately to prevent interception
      if (handlePopStateRef.current) {
          window.removeEventListener('popstate', handlePopStateRef.current);
      }
      
      // Force navigation back
      router.back(); 
  };

  const paymentEmail = contactEmail
  const paymentSubject = `Payment Confirmation - ${planName}`
  const paymentBody = `Dear Team,

I have made the payment for the ${planName} (${displayAmount}).

Payment Details:
- Amount: ${displayAmount}
- Plan: ${planName}
- Payment Method: UPI/QR Code / Manual Transfer

Please find the payment screenshot attached.

Thank you,
[Your Name]`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  const openEmailClient = () => {
    const mailtoLink = `mailto:${paymentEmail}?subject=${encodeURIComponent(paymentSubject)}&body=${encodeURIComponent(paymentBody)}`
    window.open(mailtoLink)
  }
  
  const openTelegramBot = () => {
      window.open('https://t.me/MPPSC_Support_Bot', '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <ExitSurveyModal 
        open={showExitModal} 
        onOpenChange={setShowExitModal} 
        onConfirmExit={handleConfirmExit} 
      />
      
      {/* Header */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
             <Link href="/syllabus" className="flex items-center gap-2 group">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                     <Quote size={18} fill="currentColor" className="text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">
                    Mindful
                </span>
            </Link>
             <button onClick={() => setShowExitModal(true)}>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/50">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Syllabus
                </Button>
            </button>
        </div>
      </nav>

      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        
        {/* Title Section */}
        <div className="text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 shadow-sm mb-4">
                <Sparkles className="w-3 h-3" />
                {amount === "299" || amount === "199" ? "Premium Access" : "Basic Access"}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-slate-900">
                {amount === "299" || amount === "199" ? "Unlock Complete Mastery" : "Unlock Syllabus Access"}
              </h1>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                 {amount === "299" || amount === "199"
                    ? "Get yearly access to 10 units, Quizzes, Mock Tests, and Smart Analytics." 
                    : "Get yearly access to all 10 units of the MPPSC Syllabus with detailed notes."}
              </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: QR Code & Amount */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white border border-slate-200 rounded-3xl p-1 overflow-hidden shadow-xl shadow-slate-200/50"
            >
                <div className="bg-slate-50/50 p-6 md:p-8 rounded-[20px] text-center space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-900">Scan & Pay</h2>
                        <p className="text-sm text-slate-500">Use any UPI app to complete payment</p>
                    </div>

                    <div className="relative w-64 h-64 mx-auto bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group">
                         <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
                         <Image
                           src="/arjun-qrcode.jpg" 
                           alt="Payment QR Code"
                           className="w-full h-full object-cover rounded-lg relative z-10"
                           height={256}
                           width={256}
                           priority
                         />
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-white/60 p-2 rounded-full border border-slate-100">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> UPI</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> GPay</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> PhonePe</span>
                    </div>

                     <div className="pt-4 border-t border-slate-200/60">
                         <div className="flex items-center justify-between px-4 pb-2">
                            <span className="text-sm font-medium text-slate-500">Amount to pay</span>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-medium text-slate-400 line-through decoration-slate-400/50">{originalAmount}</span>
                                <span className="text-3xl font-extrabold text-indigo-600">{displayAmount}</span>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                    {discount}
                                </span>
                            </div>
                         </div>
                         <a 
                            href="/arjun-qrcode.jpg" 
                            download="Syllabus_QR.jpg"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
                         >
                            <Download className="w-3 h-3" /> Download QR
                         </a>
                    </div>
                </div>
            </motion.div>


            {/* Right Column: Instructions */}
            <div className="space-y-6">
                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 }}
                   className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
                >
                   <div className="flex items-center gap-3 mb-4">
                       <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                       <h3 className="font-bold text-slate-900">Send Payment Screenshot</h3>
                   </div>
                   
                   <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                       Congratulations on taking the first step! 🎉 <br/>
                       Please send the screenshot to activate your account immediately.
                   </p>

                   <div className="grid grid-cols-2 gap-3 mb-6">
                        <Button 
                             onClick={openEmailClient}
                             className="w-full bg-slate-900 text-white hover:bg-slate-800 h-10 font-bold rounded-lg shadow-md"
                         >
                             <Mail className="w-4 h-4 mr-2" />
                             Via Email
                        </Button>
                        <Button 
                             onClick={openTelegramBot}
                             className="w-full bg-[#2AABEE] text-white hover:bg-[#229ED9] h-10 font-bold rounded-lg shadow-md"
                         >
                             <MessageCircle className="w-4 h-4 mr-2" />
                             Via Bot
                        </Button>
                   </div>


                   <div className="space-y-3">
                       <div className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={openEmailClient}>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-500">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Email to</p>
                                    <p className="text-sm font-semibold text-slate-900 truncate">{paymentEmail}</p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); copyToClipboard(paymentEmail, 'Email'); }}>
                                <Copy className="w-4 h-4" />
                            </Button>
                       </div>

                       <div className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-slate-500">
                                    <Quote className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Subject</p>
                                    <p className="text-sm font-semibold text-slate-900 truncate">{paymentSubject}</p>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 group-hover:text-indigo-600" onClick={() => copyToClipboard(paymentSubject, 'Subject')}>
                                <Copy className="w-4 h-4" />
                            </Button>
                       </div>
                   </div>

                   <p className="text-center text-xs text-slate-400 mt-4 font-medium">
                       We usually reply within 10 minutes on the Bot! ⚡️
                   </p>
                </motion.div>


                <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.2 }}
                   className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl shadow-indigo-200 relative overflow-hidden"
                >
                   {/* Background Pattern */}
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-6 -mb-6"></div>

                   <div className="relative z-10 flex items-start gap-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1">Activation Promise</h3>
                            <p className="text-indigo-100 text-sm leading-relaxed">
                                We verify payments manually to ensure security. Within <span className="font-bold text-white">24 hours</span>, you will receive an email with your <span className="font-bold text-white">username & password</span> to access the full syllabus.
                            </p>
                        </div>
                   </div>
                </motion.div>
            </div>
        </div>

      </div>
    </div>
  )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm font-medium">Loading secure gateway...</div>}>
            <PaymentContent />
        </Suspense>
    )
}

