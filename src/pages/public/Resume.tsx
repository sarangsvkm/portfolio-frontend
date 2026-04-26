import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Phone, Globe, ShieldCheck, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resumeService } from '../../services/resumeService';
import type { ResumeViewModel } from '../../types';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { createFallbackResume, normalizeResume } from '../../utils/resume';
import { getVerifiedContact, type VerifiedContact } from '../../components/public/verificationStorage';

const PUBLIC_RESUME_CACHE_KEY = 'public_resume_cache';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ResumePage() {
  const [data, setData] = useState<ResumeViewModel | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(PUBLIC_RESUME_CACHE_KEY);
    if (!cached) return null;
    try {
      return normalizeResume(JSON.parse(cached) as ResumeViewModel);
    } catch {
      localStorage.removeItem(PUBLIC_RESUME_CACHE_KEY);
      return null;
    }
  });
  const [loading, setLoading] = useState(() => data === null);
  const verifiedContact = getVerifiedContact();

  useEffect(() => {
    let isMounted = true;
    resumeService.getResume()
      .then((res) => {
        const normalized = normalizeResume(res);
        if (!isMounted) return;
        setData(normalized);
        localStorage.setItem(PUBLIC_RESUME_CACHE_KEY, JSON.stringify(normalized));
      })
      .catch(() => {
        if (!isMounted) return;
        setData((current) => current ?? normalizeResume(createFallbackResume()));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // No need for storage listener here as OtpGate handles re-renders on verification change

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent" 
        />
      </div>
    );
  }

  if (!data) return null;

  const profileImageUrl = resolveAssetUrl(data.profile.imageUrl);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 md:px-8">
      {/* HEADER SECTION - Upgraded to Glass */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-4 rounded-[32px] glass p-8 shadow-2xl dark:border-white/5 md:flex-row md:items-center md:justify-between aura-glow"
      >
        <div className="space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 transition-all hover:translate-x-[-4px]">
            <ArrowLeft className="h-4 w-4" />
            Return Home
          </Link>
          <h1 className="text-3xl font-black tracking-tighter text-gray-950 dark:text-white">
            Professional <span className="text-indigo-600">Resume</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Securely hosting your professional credentials.
          </p>
        </div>
        {verifiedContact && (
          <button 
            onClick={() => {
              localStorage.removeItem('public_contact_verified');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <Lock className="h-4 w-4" /> Lock Info
          </button>
        )}
      </motion.div>

      {/* PREMIUM ATS MODEL VIEW WITH ANIMATIONS */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-black border border-gray-100 dark:border-white/5 rounded-[48px] overflow-hidden shadow-2xl relative"
      >
        {/* Subtle page background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-[800px] mx-auto p-10 md:p-20 font-serif leading-relaxed text-gray-900 dark:text-gray-100">
          
          {/* Header with Image Animation - Fixed Overlap */}
          <motion.header variants={itemVariants} className="relative mb-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 text-center lg:text-left">
            <div className="space-y-5 flex-1 order-2 lg:order-1">
              {profileImageUrl && (
                <div className="flex justify-center lg:hidden mb-6">
                  <img
                    src={profileImageUrl}
                    alt={data.profile.name}
                    className="h-24 w-24 rounded-[24px] object-cover border-2 border-gray-50 shadow-xl dark:border-white/10"
                  />
                </div>
              )}
              
              <h2 className="text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none">
                {data.profile.name}
              </h2>
              
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-x-5 gap-y-3 text-sm text-gray-500 dark:text-gray-400 font-sans font-medium uppercase tracking-widest">
                {data.profile.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-indigo-500" /> {data.profile.location}</span>
                )}
                {(verifiedContact?.ownerPhone || data.profile.phone) && (
                  <div className="flex flex-col lg:items-start items-center gap-1">
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-indigo-500" /> {verifiedContact?.ownerPhone || data.profile.phone}</span>
                  </div>
                )}
                {data.profile.email && (
                  <span className="flex items-center gap-1.5"><Mail size={14} className="text-indigo-500" /> {data.profile.email}</span>
                )}
              </div>
              
              <div className="flex justify-center lg:justify-start gap-5 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-sans pt-2">
                {data.profile.socialMediaLinks.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition-colors border-b-2 border-transparent hover:border-indigo-500/30 pb-1">
                    {link.platform}
                  </a>
                ))}
                <a href="https://sarangsvkm.in" target="_blank" rel="noreferrer" className="hover:text-indigo-500 transition-colors border-b-2 border-transparent hover:border-indigo-500/30 pb-1 flex items-center gap-1">
                  <Globe size={12} /> Portfolio
                </a>
              </div>
            </div>

            {profileImageUrl && (
              <div className="hidden lg:block shrink-0 order-2">
                <motion.img
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  src={profileImageUrl}
                  alt={data.profile.name}
                  className="h-32 w-32 rounded-[32px] object-cover border-4 border-gray-50 shadow-2xl dark:border-white/10"
                />
              </div>
            )}
          </motion.header>

          {/* Sections Animate Sequentially */}
          {data.profile.about && (
            <motion.section variants={itemVariants} className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b-2 border-black dark:border-white pb-3 mb-6 text-black dark:text-white flex items-center gap-3">
                 Summary
              </h3>
              <p className="text-[16px] text-justify leading-relaxed font-medium text-gray-600 dark:text-gray-300 italic">
                "{data.profile.about}"
              </p>
            </motion.section>
          )}

          {data.experiences.length > 0 && (
            <motion.section variants={itemVariants} className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b-2 border-black dark:border-white pb-3 mb-8 text-black dark:text-white">
                Experience Highlights
              </h3>
              <div className="space-y-10">
                {data.experiences.map((exp, i) => (
                  <div key={i} className="group">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-baseline gap-2 mb-2">
                      <h4 className="font-black text-xl tracking-tight group-hover:text-indigo-600 transition-colors">{exp.role}</h4>
                      <span className="text-xs font-sans font-black text-indigo-500/60 uppercase tracking-widest">{exp.startDate} – {exp.endDate || 'Present'}</span>
                    </div>
                    <p className="text-sm font-sans font-black text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-widest leading-none">
                      {exp.company}
                    </p>
                    <ul className="list-none space-y-3 text-[14px] font-medium text-gray-600 dark:text-gray-400">
                      {(exp.description || '').split(/(?:\\n|\\r|•)/).filter(p => p.trim()).map((point, j) => (
                        <li key={j} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-indigo-500/40">
                          {point.trim()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {data.projects.length > 0 && (
            <motion.section variants={itemVariants} className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b-2 border-black dark:border-white pb-3 mb-8 text-black dark:text-white">
                Technical Projects
              </h3>
              <div className="grid gap-10">
                {data.projects.map((proj, i) => (
                  <div key={i} className="group relative pl-6 border-l-2 border-gray-100 dark:border-white/5 hover:border-indigo-500/30 transition-colors">
                    <h4 className="font-black text-lg mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">{proj.title}</h4>
                    <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 mb-3">{proj.description}</p>
                    {proj.techStack && (
                      <div className="flex flex-wrap gap-2">
                        {proj.techStack.split(',').map((tech, k) => (
                           <span key={k} className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest px-2 py-0.5 bg-indigo-50 dark:bg-white/5 rounded-md">
                             {tech.trim()}
                           </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {data.skills.length > 0 && (
            <motion.section variants={itemVariants} className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b-2 border-black dark:border-white pb-3 mb-6 text-black dark:text-white">
                Core Competencies
              </h3>
              <div className="grid grid-cols-1 gap-y-4 text-[14px]">
                {Object.entries(
                  data.skills.reduce((acc: Record<string, string[]>, skill) => {
                    const cat = skill.category || 'General';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(skill.name);
                    return acc;
                  }, {})
                ).map(([cat, skills], i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <strong className="font-black text-[11px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{cat}</strong>
                    <p className="font-medium text-gray-600 dark:text-gray-400">
                      {skills.join(' • ')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {data.educations.length > 0 && (
            <motion.section variants={itemVariants} className="mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b-2 border-black dark:border-white pb-3 mb-8 text-black dark:text-white">
                Academic Foundation
              </h3>
              <div className="space-y-10">
                {data.educations.map((edu, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:justify-between gap-2">
                    <div>
                      <h4 className="font-black text-lg tracking-tight">{edu.degree}</h4>
                      <p className="text-[14px] font-black text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mb-1">{edu.institution}</p>
                      <p className="text-[13px] font-medium text-gray-500 italic">{edu.fieldOfStudy}</p>
                    </div>
                    <span className="text-xs font-sans font-black text-gray-400 uppercase tracking-widest">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

        </div>
        
        {/* Bottom Branding */}
        <div className="bg-gray-50 dark:bg-white/[0.02] py-8 text-center border-t border-gray-100 dark:border-white/5">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 italic">
             Designed for Impact • Built with Precision
           </p>
        </div>
      </motion.div>
    </div>
  );
}
