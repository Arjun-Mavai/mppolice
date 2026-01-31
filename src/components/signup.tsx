"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Quote, Loader2, ArrowLeft, UserPlus } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
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
      const res = await fetch("/api/auth/mppsc-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Account created!", {
          description: "Please sign in with your credentials.",
        })
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      } else {
        setError(data.error || "Signup failed")
        toast.error("Signup failed", {
            description: data.error,
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
      
      {/* Left Side: Visuals (Same as Login) */}
      <div className="hidden lg:flex relative bg-slate-900 overflow-hidden items-center justify-center p-12">
         <div className="absolute inset-0 opacity-20">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
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
                 <h1 className="text-4xl font-bold font-display text-white tracking-tight">Join MPPSC Syllabus</h1>
                 <p className="text-lg text-slate-400">
                    Create your account to start your journey towards exam success.
                 </p>
             </div>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
         <div className="absolute top-6 left-6">
             <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                 <ArrowLeft className="w-4 h-4" /> Back to Login
             </Link>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
         >
             <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-slate-900">Create an account</h2>
                 <p className="text-slate-500 text-sm">Enter your details to register</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
                     <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="John Doe"
                     />
                 </div>

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
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...
                         </>
                     ) : "Sign Up"}
                 </Button>
             </form>

             <div className="text-center pt-2">
                 <p className="text-xs text-slate-400">
                     Already have an account? <Link href="/login" className="text-indigo-600 hover:underline font-semibold">Sign In</Link>
                 </p>
             </div>
         </motion.div>
      </div>
    </div>
  )
}
