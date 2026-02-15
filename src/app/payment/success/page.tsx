'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/app');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Payment Successful!</h1>
          <p className="text-zinc-400">
            Thank you for your purchase. Your account has been upgraded to Pro.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => router.push('/app')}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-zinc-200"
          >
            Continue to App
          </button>
        </div>

        <p className="text-xs text-zinc-500">Redirecting in {countdown} seconds...</p>
      </div>
    </div>
  );
}
