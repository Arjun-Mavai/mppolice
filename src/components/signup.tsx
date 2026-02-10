"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Quote, Loader2, ArrowLeft, UserPlus } from "lucide-react"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 SIGNUP PAGE — Admin creates new users with full control
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fields: name, email, password + role, planTier, accessMonths, phone
// Used inside /admin/create-user and /signup routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("guest")
  const [planTier, setPlanTier] = useState("free")
  const [accessMonths, setAccessMonths] = useState(6)
  const [phone, setPhone] = useState("")
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
        body: JSON.stringify({ 
          name, email, password,
          role, planTier, 
          accessMonths: Number(accessMonths),
          phone: phone || null
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Account created!", {
          description: data.message || "User can now log in.",
        })
        // Reset form for next user creation
        setName(""); setEmail(""); setPassword(""); setPhone("");
        setPlanTier("free"); setRole("guest"); setAccessMonths(6);
      } else {
        setError(data.error || "Signup failed")
        toast.error("Signup failed", { description: data.error })
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
                 <UserPlus className="w-10 h-10 text-white" />
             </motion.div>
             <div className="space-y-4">
                 <h1 className="text-4xl font-bold font-display text-white tracking-tight">Create New User</h1>
                 <p className="text-lg text-slate-400">
                    Set up account with role, plan tier, and access duration.
                 </p>
             </div>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
         <div className="absolute top-6 left-6">
             <Link href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                 <ArrowLeft className="w-4 h-4" /> Back to Admin
             </Link>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
         >
             <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                 <p className="text-slate-500 text-sm">Fill details — user can login immediately</p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-4">
                 {/* Name */}
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Full Name</label>
                     <input 
                        type="text" value={name}
                        onChange={(e) => setName(e.target.value)} required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="John Doe"
                     />
                 </div>

                 {/* Email */}
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Email Address</label>
                     <input 
                        type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="you@example.com"
                     />
                 </div>

                 {/* Password */}
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Password</label>
                     <input 
                        type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="Min 8 chars, A-z, 0-9, @$!%*?&"
                     />
                     <p className="text-xs text-slate-400">1 uppercase, 1 lowercase, 1 digit, 1 special char</p>
                 </div>

                 {/* Phone (optional) */}
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Phone <span className="text-slate-400">(optional)</span></label>
                     <input 
                        type="tel" value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 text-slate-900"
                        placeholder="+91 9876543210"
                     />
                 </div>

                 {/* Role + Plan Tier — side by side */}
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Role</label>
                         <select 
                            value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 bg-white"
                         >
                             <option value="guest">Guest</option>
                             <option value="admin">Admin</option>
                         </select>
                     </div>
                     <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Plan Tier</label>
                         <select 
                            value={planTier} onChange={(e) => setPlanTier(e.target.value)}
                            className="w-full h-11 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900 bg-white"
                         >
                             <option value="free">Free</option>
                             <option value="lite">Lite</option>
                             <option value="pro">Pro</option>
                         </select>
                     </div>
                 </div>

                 {/* Access Duration */}
                 <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-slate-700">Access Duration (months)</label>
                     <div className="flex items-center gap-3">
                         <input 
                            type="number" value={accessMonths} min={0} max={24}
                            onChange={(e) => setAccessMonths(Number(e.target.value))}
                            className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-slate-900"
                         />
                         <span className="text-xs text-slate-400 whitespace-nowrap">0 = unlimited</span>
                     </div>
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
                     ) : (
                       <><UserPlus className="w-4 h-4 mr-2" /> Create User</>
                     )}
                 </Button>
             </form>
         </motion.div>
      </div>
    </div>
  )
}
