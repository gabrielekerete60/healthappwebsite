'use client';

import React, { Suspense } from 'react';
import { Loader2, ChevronLeft, Sparkles, GraduationCap, Bookmark } from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { LearningPathCard } from '@/components/learning/LearningPathCard';
import { LearningPathSkeleton } from '@/components/learning/LearningPathSkeleton';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import ScrollToTop from '@/components/common/ScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';

function LearningContent() {
  const t = useTranslations('learningPage');
  const commonT = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';
  
  const { allPaths, recommendedPaths, enrolledPaths, loading, offlinePaths } = useLearning();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const handleTabChange = (tab: string) => {
    router.push(`/learning?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden">
      {/* Theme Magic Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.07, 0.03]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5%] left-[-5%] w-[50%] h-[50%] bg-blue-400 dark:bg-blue-600 blur-[120px] rounded-full pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.03, 0.07, 0.03]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-400 dark:bg-indigo-600 blur-[120px] rounded-full pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()} 
          className="group inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-all font-black uppercase tracking-widest text-[10px] mb-8 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Go Back
          </motion.button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <Sparkles size={12} className="text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Protocol Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{t('title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-16">
          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-1">
            <button
              onClick={() => handleTabChange('all')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <GraduationCap size={14} />
              {commonT('browseCourses')}
            </button>
            <button
              onClick={() => handleTabChange('enrolled')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'enrolled'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Bookmark size={14} />
              {commonT('myEnrollments')}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-24 w-full"
            >
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                  {[1, 2, 3].map((i) => (
                    <LearningPathSkeleton key={i} />
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key={`${activeTab}-content`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-24"
            >
              {activeTab === 'enrolled' ? (
                <section className="space-y-10">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest shrink-0">{commonT('myEnrollments')}</h2>
                    <div className="h-px w-full bg-gradient-to-r from-blue-600/20 to-transparent" />
                  </div>
                  {enrolledPaths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                      {enrolledPaths.map((path, index) => (
                        <LearningPathCard 
                          key={path.id} 
                          path={path} 
                          index={index} 
                          isOffline={offlinePaths.includes(path.id)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <Bookmark size={40} />
                      </div>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Course Directory</span>
                      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Start your first health course from our course directory.</p>
                      <button 
                        onClick={() => handleTabChange('all')}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                      >
                        Explore Courses
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <>
                  {recommendedPaths.length > 0 && (
                    <section className="space-y-10">
                      <div className="flex items-center gap-4">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest shrink-0">{t('recommended')}</h2>
                        <div className="h-px w-full bg-gradient-to-r from-blue-600/20 to-transparent" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                        {recommendedPaths.map((path, index) => (
                          <LearningPathCard 
                            key={path.id} 
                            path={path} 
                            index={index} 
                            isOffline={offlinePaths.includes(path.id)} 
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="space-y-10">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest shrink-0">{t('allCourses')}</h2>
                      <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                      {allPaths.map((path, index) => (
                        <LearningPathCard 
                          key={path.id} 
                          path={path} 
                          index={index} 
                          isOffline={offlinePaths.includes(path.id)} 
                        />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ScrollToTop />
    </div>
  );
}

export default function LearningPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <LearningContent />
    </Suspense>
  );
}
