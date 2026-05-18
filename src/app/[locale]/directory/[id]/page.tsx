'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { getExpertById } from '@/services/directoryService';
import { PublicExpert } from '@/types/expert';
import { Link } from '@/i18n/routing';
import ExpertHeader from '@/components/expert/ExpertHeader';
import ExpertServicesList from '@/components/expert/ExpertServicesList';
import ExpertContactCard from '@/components/expert/ExpertContactCard';
import { ChevronLeft, Info, FileText, ShieldCheck, Loader2 } from 'lucide-react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { RestrictedPage } from '@/components/common/RestrictedPage';

export default function ExpertDetailsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useUserAuth();
  const [expert, setExpert] = useState<PublicExpert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      getExpertById(id).then(data => {
        setExpert(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (authLoading || (loading && !expert)) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 pt-32 sm:pt-40">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!user) return (
    <RestrictedPage 
      title="Specialist Profile Restricted"
      description="Detailed clinical profiles, verified credentials, and appointment booking are reserved for authenticated network members."
    />
  );

  if (!expert && !loading) {
    notFound();
  }

  if (!expert) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors pt-32 sm:pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-4">
        {/* Navigation */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/directory" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-all font-black uppercase tracking-widest text-[10px] shadow-sm">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Registry Directory
          </Link>

          {user.uid === id && (
            <Link href="/expert/setup" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200 dark:shadow-none">
              Edit My Public Identity
            </Link>
          )}
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-3xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800 overflow-hidden">
          <ExpertHeader 
            name={expert.name} 
            type={expert.type} 
            specialty={expert.specialty} 
            rating={expert.rating} 
            verified={expert.verificationStatus === 'verified'} 
            imageUrl={expert.imageUrl}
          />

          {/* Content */}
          <div className="p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
            <div className="lg:col-span-7 space-y-12 sm:space-y-16">
              {/* About Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
                    <Info size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Clinical Profile</h2>
                </div>
                
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 rounded-full" />
                  <p className="pl-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {expert.bio || `${expert.name} is a leading specialist in ${expert.specialty} with over 15 years of clinical practice. Their work focuses on integrating precision medical science with evidence-based traditional wisdom to provide holistic patient outcomes.`}
                  </p>
                </div>
              </section>

              {/* Verified Expertise Badge */}
              {expert.verificationStatus === 'verified' && (
                <div className="p-8 rounded-[32px] bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20 text-white">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-xs">Credentialed Expert</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">Network Verified Status</p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    This practitioner has completed Stage 3 Clinical Verification. Their medical license, board certifications, and clinical experience have been manually reviewed by the Ikiké Health Registry.
                  </p>
                </div>
              )}

              {/* Services Section */}
              <ExpertServicesList />

              {/* Verified Credentials Summary */}
              {expert.verificationStatus === 'verified' && (
                <section className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-6">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Academic Integrity</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      All clinical profiles on Ikiké undergo rigorous credentialing. The registry ensures that only verified professionals can provide high-stakes medical advice.
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar Contact */}
            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <ExpertContactCard 
                  location={expert.location} 
                  expertId={expert.id} 
                  expertName={expert.name} 
                  email={expert.email}
                  phone={expert.phone}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
