'use client';

import React from 'react';
import SearchSection from "@/components/SearchSection";
import HomeIntelligenceSection from "@/components/HomeIntelligenceSection";
import FeedSection from "@/components/FeedSection";
import SymptomWizard from "@/components/discovery/SymptomWizard";
import { Shield, Users, Video, BookOpen, Calendar, ArrowRight, CheckCircle2, Star, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BentoCard, StatMetric } from "@/components/home/HomeComponents";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="relative bg-slate-50 dark:bg-[#0B1221] transition-colors min-h-screen overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] dark:opacity-[0.03] mix-blend-overlay" />
      </div>
      
      <div className="relative z-10 flex flex-col">
        {/* Hero & Search */}
        <section className="w-full">
          <SearchSection />
        </section>

        {/* Intelligence Hub: Command Center & Pillars Grouped */}
        <section className="relative w-full py-8 sm:py-16 overflow-hidden">
          {/* Subtle Section Divider Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-200/40 to-transparent dark:via-blue-900/10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-24">
            
            {/* Unified Command Center */}
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left/Main Area: Symptom Wizard */}
                <div className="lg:col-span-7 flex flex-col h-full">
                  <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[40px] p-6 sm:p-8 shadow-2xl shadow-blue-900/5 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-700 h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                      <Sparkles className="w-32 h-32 text-blue-600" />
                    </div>
                    <div className="mb-6 relative z-10 shrink-0 text-center sm:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm mb-3">
                        {t('home.clinicalDiscovery')}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                        {t('home.guidedDiscoveryTitle')}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-lg">
                        {t('home.guidedDiscoveryDesc')}
                      </p>
                    </div>
                    <div className="relative z-10 flex-1">
                      <SymptomWizard />
                    </div>
                  </div>
                </div>

                {/* Right Area: Telemetry Dashboard */}
                <div className="lg:col-span-5">
                  <HomeIntelligenceSection />
                </div>
                
              </div>
            </div>

            {/* Intelligence Pillars - Bento Grid Style */}
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16 sm:mb-24 space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm border border-indigo-100/50 dark:border-indigo-800/50">
                  {t('home.foundationalIntegrity')}
                </div>
                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
                  {t('home.featuresTitle')}
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                  {t('home.featuresSubtitle')}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
                {/* Feature 1 - Large Span */}
                <BentoCard 
                  className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/50 border-blue-100/50 dark:border-blue-900/20"
                  icon={<Shield className="w-8 h-8 text-blue-600" />}
                  title={t('home.feature1Title')}
                  description={t('home.feature1Desc')}
                  delay={0}
                />
                {/* Feature 2 */}
                <BentoCard 
                  className="bg-white dark:bg-slate-900 border-slate-200/50 dark:border-white/5"
                  icon={<Video className="w-8 h-8 text-red-500" />}
                  title={t('home.feature2Title')}
                  description={t('home.feature2Desc')}
                  delay={0.1}
                />
                {/* Feature 3 */}
                <BentoCard 
                  className="bg-white dark:bg-slate-900 border-slate-200/50 dark:border-white/5"
                  icon={<Users className="w-8 h-8 text-emerald-500" />}
                  title={t('home.feature3Title')}
                  description={t('home.feature3Desc')}
                  delay={0.2}
                />
                {/* Feature 4 */}
                <BentoCard 
                  className="bg-white dark:bg-slate-900 border-slate-200/50 dark:border-white/5"
                  icon={<Calendar className="w-8 h-8 text-amber-500" />}
                  title={t('home.feature4Title')}
                  description={t('home.feature4Desc')}
                  delay={0.3}
                />
                {/* Feature 5 */}
                <BentoCard 
                  className="md:col-span-1 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800/50 border-purple-100/50 dark:border-purple-900/20"
                  icon={<BookOpen className="w-8 h-8 text-purple-600" />}
                  title={t('home.feature5Title')}
                  description={t('home.feature5Desc')}
                  delay={0.4}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Global Registry CTA - Modernized */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-slate-900 dark:bg-[#0B1221] rounded-[64px] p-8 sm:p-16 lg:p-24 text-white shadow-3xl relative overflow-hidden border border-slate-800 dark:border-white/10 group">
              {/* Animated Background Layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-indigo-600/30 opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
              
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:w-1/2 space-y-10"
                >
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                      <Star className="w-3 h-3 text-amber-400 fill-current" /> {t('home.networkExpansion')}
                    </div>
                    <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05]">
                      {t('home.ctaTitle')}
                    </h2>
                    <p className="text-xl font-medium text-slate-400 leading-relaxed max-w-lg">
                      {t('home.ctaSubtitle')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/directory" className="group/btn relative inline-flex justify-center items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-all shadow-xl active:scale-95">
                      {t('home.ctaButton')}
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <Link href="/expert/register" className="inline-flex justify-center items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-[11px] hover:bg-white/10 transition-all border border-white/10 active:scale-95 backdrop-blur-md">
                      {t('home.ctaRegister')}
                    </Link>
                  </div>

                  <div className="pt-6 flex items-center gap-4 text-sm font-medium text-slate-400">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                      ))}
                    </div>
                    <p>{t('home.joinVerified')}</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="lg:w-1/2 grid grid-cols-2 gap-4 sm:gap-6 w-full"
                >
                  <StatMetric value="500+" label={t('home.statDoctors')} delay={0} color="text-blue-400" />
                  <StatMetric value="200+" label={t('home.statHerbal')} delay={0.1} color="text-emerald-400" />
                  <StatMetric value="100+" label={t('home.statCenters')} delay={0.2} color="text-purple-400" />
                  <StatMetric value="50k+" label={t('home.statRecords')} delay={0.3} color="text-amber-400" />
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Intelligence Feed Integration */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-[64px] overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-2xl bg-white/50 dark:bg-slate-900/30 backdrop-blur-3xl group/feed hover:border-blue-500/30 transition-all duration-1000">
              <FeedSection />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

