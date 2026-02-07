"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Zod Schema for Email Validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Something went wrong");
      }
      
      setIsSubmitted(true);
      toast.success("Reset link sent!", {
        description: "Check your email inbox for instructions.",
      });

    } catch (error: any) {
      toast.error("Request failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50 font-sans">
      
      {/* Visual Side (Left) */}
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
                   <Mail className="w-10 h-10 text-white" />
               </motion.div>
               <div className="space-y-4">
                   <h1 className="text-4xl font-bold font-display text-white tracking-tight">Forgot Password?</h1>
                   <p className="text-lg text-slate-400">
                      No worries, we'll help you reset it and get back to your preparation.
                   </p>
               </div>
           </div>
        </div>

      {/* Form Side (Right) */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 relative">
         <div className="absolute top-6 left-6">
             <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
                 <ArrowLeft className="w-4 h-4" /> Back to Login
             </Link>
         </div>

         <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100"
         >
             {!isSubmitted ? (
               <>
                 <div className="text-center space-y-2">
                     <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                     <p className="text-slate-500 text-sm">Enter your email to receive reset instructions</p>
                 </div>

                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Email Address</label>
                         <Input 
                            {...register("email")}
                            type="email"
                            placeholder="you@example.com"
                            className="h-11"
                         />
                         {errors.email && (
                            <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                         )}
                     </div>

                     <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full h-11 font-bold bg-slate-900 hover:bg-slate-800 text-white"
                     >
                         {isLoading ? (
                             <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                             </>
                         ) : "Send Reset Link"}
                     </Button>
                 </form>
               </>
             ) : (
               <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
                    <p className="text-slate-500 text-sm">
                      We have sent password reset instructions to your email address.
                    </p>
                  </div>
                  <Button asChild className="w-full h-11 font-bold" variant="outline">
                    <Link href="/login">Back to Login</Link>
                  </Button>
               </div>
             )}
         </motion.div>
      </div>
    </div>
  );
}
