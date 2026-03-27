'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2
} from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { paymentService, Transaction } from '@/services/paymentService';
import { 
  TransactionHeader, TransactionCard, EmptyTransactions 
} from '@/components/transactions/TransactionComponents';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const data = await paymentService.getUserTransactions();
        setTransactions(data);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pt-32 sm:pt-40 pb-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-400/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-indigo-400/10 blur-[80px] rounded-full" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft size={12} /> Back
        </button>

        <TransactionHeader />

        {transactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        )}

        <div className="mt-16 p-8 bg-blue-600 rounded-[32px] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-black uppercase tracking-tight">Need a formal invoice?</h3>
              <p className="text-blue-100 font-medium text-sm">Contact our clinical support team for corporate billing and receipts.</p>
            </div>
            <Link 
              href="/support" 
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
