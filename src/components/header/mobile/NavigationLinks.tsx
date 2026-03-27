import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, GraduationCap, Bookmark, PencilRuler, Sparkles } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { NAVIGATION_LINKS } from '@/config/navigation';
import { UserProfile, isExpertRole } from '@/types/user';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';

interface NavigationLinksProps {
  t: any;
  onClose: () => void;
  itemVariants: Variants;
  userProfile: UserProfile | null;
}

export function NavigationLinks({ t, onClose, itemVariants, userProfile }: NavigationLinksProps) {
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Intelligence Grid</p>
      <nav className="flex flex-col gap-1">
        {userProfile && userProfile.role === 'admin' && (
          <motion.div variants={itemVariants}>
            <Link 
              href="/admin/dashboard" 
              className="flex items-center justify-between p-5 rounded-[24px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl group mb-4 transition-all active:scale-95 border border-slate-100 dark:border-slate-800" 
              onClick={onClose}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <ShieldCheck size={20} className="text-emerald-500" />
                </div>
                <span className="text-xl font-black uppercase tracking-tight">
                  Admin Console
                </span>
              </div>
              <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        )}

        {userProfile && isExpertRole(userProfile.role) && userProfile.role !== 'admin' && (
          <motion.div variants={itemVariants}>
            <Link 
              href="/expert/dashboard" 
              className="flex items-center justify-between p-5 rounded-[24px] bg-blue-600 text-white shadow-xl shadow-blue-500/20 group mb-4 transition-all active:scale-95" 
              onClick={onClose}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <LayoutDashboard size={20} />
                </div>
                <span className="text-xl font-black uppercase tracking-tight">
                  {t('profile.menu.expertConsole')}
                </span>
              </div>
              <ChevronRight size={20} className="text-white/50 group-hover:text-white transition-colors" />
            </Link>
          </motion.div>
        )}

        {NAVIGATION_LINKS.map((link) => {
          const isLearning = link.href === '/learning';
          
          if (isLearning && userProfile) {
            return (
              <motion.div key={link.href} variants={itemVariants} className="flex flex-col">
                <button 
                  onClick={() => setCoursesExpanded(!coursesExpanded)}
                  className={`flex items-center justify-between p-4 rounded-2xl group transition-all ${coursesExpanded ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <span className={`text-xl font-black transition-colors tracking-tight ${coursesExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    {t(link.labelKey) || link.defaultLabel}
                  </span>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${coursesExpanded ? 'rotate-180 text-blue-500' : 'text-slate-200'}`} />
                </button>
                
                <AnimatePresence>
                  {coursesExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden flex flex-col gap-1 ml-4 mt-1 border-l-2 border-slate-100 dark:border-slate-800 pl-4"
                    >
                      <MobileSubLink 
                        href="/learning" 
                        label={t('common.browseCourses')} 
                        icon={<GraduationCap size={18} />} 
                        onClick={onClose} 
                      />
                      <MobileSubLink 
                        href="/learning?tab=enrolled" 
                        label={t('common.myEnrollments')} 
                        icon={<Bookmark size={18} />} 
                        onClick={onClose} 
                      />
                      {isExpertRole(userProfile.role) && (
                        <>
                          <div className="my-2 border-t border-slate-50 dark:border-slate-800 w-1/2" />
                          <MobileSubLink 
                            href="/expert/dashboard?tab=courses" 
                            label={t('common.myCreations')} 
                            icon={<PencilRuler size={18} />} 
                            onClick={onClose} 
                            isExpert
                          />
                          <MobileSubLink 
                            href="/expert/courses/new" 
                            label={t('common.hostCourse')} 
                            icon={<Sparkles size={18} />} 
                            onClick={onClose} 
                            isExpert
                          />
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          return (
            <motion.div key={link.href} variants={itemVariants}>
              <Link 
                href={link.href} 
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 group transition-all" 
                onClick={onClose}
              >
                <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                  {t(link.labelKey) || link.defaultLabel}
                </span>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}

function MobileSubLink({ href, label, icon, onClick, isExpert }: { href: string, label: string, icon: React.ReactNode, onClick: () => void, isExpert?: boolean }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all active:scale-95 ${isExpert ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/5' : 'text-slate-600 dark:text-slate-400'}`}
    >
      <div className={`${isExpert ? 'text-blue-500' : 'text-slate-400'}`}>
        {icon}
      </div>
      <span className="text-base font-bold tracking-tight">
        {label}
      </span>
    </Link>
  );
}
