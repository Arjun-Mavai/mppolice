'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import { motion } from 'framer-motion';

// Zod Schema for Email Validation
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setIsSubmitted(true);
      toast.success('Reset link sent!', {
        description: 'Check your email inbox for instructions.',
      });
    } catch (error: unknown) {
      toast.error('Request failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 font-sans lg:grid-cols-2">
      {/* Visual Side (Left) */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-slate-900 p-12 lg:flex">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/30 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-purple-500/30 blur-[100px]"></div>

        <div className="relative z-10 max-w-lg space-y-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl"
          >
            <Mail className="h-10 w-10 text-white" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">
              Forgot Password?
            </h1>
            <p className="text-lg text-slate-400">
              No worries, we'll help you reset it and get back to your preparation.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="absolute top-6 left-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Login
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          {!isSubmitted ? (
            <>
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500">
                  Enter your email to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full bg-slate-900 font-bold text-white hover:bg-slate-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-6 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
                <p className="text-sm text-slate-500">
                  We have sent password reset instructions to your email address.
                </p>
              </div>
              <Button asChild className="h-11 w-full font-bold" variant="outline">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
