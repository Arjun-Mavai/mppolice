"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Quote, Loader2, ArrowLeft } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/mppsc-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        // Update Global Store
        useSettingsStore.getState().setUser(data.user, true);
        router.refresh()
        toast.success("Welcome back!", {
          description: "Accessing your syllabus...",
        })
        setTimeout(() => {
          // Redirect logic based on subscription
          if (data.user?.is_subscribed) {
             router.push("/syllabus/quiz");
          } else {
             router.push("/");
          }
        }, 800)
      } else {
        setError(data.error || "Login failed")
        toast.error("Login failed", {
            description: data.error || "Please check your credentials",
        })
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-sans">
      
      {/* Left Side: Visuals */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center p-12">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-20">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         
         {/* Glowing orbs */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px] -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] -ml-20 -mb-20"></div>

         <div className="relative z-10 text-center space-y-8 max-w-lg">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-2xl"
             >
                 <Quote className="w-10 h-10 text-white" />
             </motion.div>
             <div className="space-y-4">
                 <h1 className="text-4xl font-bold font-display text-white tracking-tight">MPPSC Syllabus</h1>
                 <p className="text-lg text-slate-400">
                    Your comprehensive guide to mastering the exam. Access detailed unit breakdowns and premium content.
                 </p>
             </div>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
         {/* Mobile Background Image (Visible only on small screens) */}
         <div className="absolute inset-0 lg:hidden z-0">
             <div className="absolute inset-0 bg-slate-900/90 z-10"></div>
             <img 
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop" 
                alt="Background" 
                className="w-full h-full object-cover"
             />
         </div>

         <div className="absolute top-6 left-6 z-20">
             <Link href="/" className="flex items-center gap-2 text-slate-500 lg:text-slate-500 text-slate-300 hover:text-white lg:hover:text-slate-900 transition-colors text-sm font-medium">
                 <ArrowLeft className="w-4 h-4" /> Back to Home
             </Link>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 relative z-20"
         >
             <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-slate-900">Sign in to MPPSC Prep</h2>
                 <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Email Address</label>
                     <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="you@example.com"
                     />
                 </div>

                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Password</label>
                     <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="••••••••"
                     />
                 </div>

                 {error && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
                        {error}
                    </div>
                 )}

                 <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-11 font-bold bg-slate-900 hover:bg-slate-800 text-white"
                 >
                     {loading ? (
                         <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                         </>
                     ) : "Sign In"}
                 </Button>
             </form>

             <div className="text-center pt-2 space-y-2">
                 <p className="text-xs text-slate-400">
                     <Link href="/payment" className="hover:text-indigo-600 transition-colors font-semibold">Buy Premium Plan</Link>
                 </p>
             </div>
         </motion.div>
      </div>
    </div>
  )
}
