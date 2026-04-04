import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Briefcase,
  Lock,
  FileText,
  Phone,
  Sparkles,
  ArrowRight,
  Code2,
  Terminal,
  Cpu,
  Layers,
} from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import type { ResumeViewModel } from '../../types';
import { createFallbackResume, normalizeResume } from '../../utils/resume';
import { resolveAssetUrl } from '../../utils/assetUrl';
import VerificationGate from '../../components/public/VerificationGate';
import { getVerifiedContact, type VerifiedContact } from '../../components/public/verificationStorage';

const PUBLIC_RESUME_CACHE_KEY = 'public_resume_cache';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Home() {
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
  const [verifiedContact, setVerifiedContact] = useState<VerifiedContact | null>(() => getVerifiedContact());
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

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

  useEffect(() => {
    const syncVerification = () => setVerifiedContact(getVerifiedContact());
    window.addEventListener('storage', syncVerification);
    return () => window.removeEventListener('storage', syncVerification);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent" 
        />
      </div>
    );
  }

  if (!data) return null;

  const { profile, projects, experiences, educations, skills } = data;
  const profileImageUrl = resolveAssetUrl(profile.imageUrl);
  const resumeUrl = resolveAssetUrl(profile.resumeUrl);

  const skillGroups = skills.reduce((acc: Record<string, typeof skills>, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="bg-white text-gray-900 transition-colors duration-300 dark:bg-black dark:text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200">
      
      {/* Premium Hero Section */}
      <section id="about" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-32 pb-20 px-6">
        {/* Animated Background Gradients */}
        <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-indigo-500/5 to-transparent blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 bg-purple-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 bg-blue-500/10 blur-[120px] animate-pulse delay-700" />
        
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-16 text-center lg:flex-row lg:text-left lg:items-center">
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/10">
                <Sparkles size={16} /> Welcome Potential Partner
              </div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-gray-950 dark:text-white">
                  I'm <span className="text-gradient drop-shadow-xl">{profile.name}</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {profile.about}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                {resumeUrl && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      to="/resume" 
                      className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-black text-lg shadow-2xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center gap-3 group"
                    >
                      {verifiedContact ? (
                        <>
                          <FileText size={22} className="group-hover:rotate-12 transition-transform" /> View Resume
                        </>
                      ) : (
                        <>
                          <Lock size={20} className="opacity-70" /> Unlock Resume
                        </>
                      )}
                    </Link>
                  </motion.div>
                )}
                
                <div className="flex gap-4">
                  {profile.socialMediaLinks.map((link, i) => (
                    <motion.a
                      key={i}
                      href={link.url}
                      whileHover={{ y: -5, scale: 1.1 }}
                      target="_blank"
                      rel="noreferrer"
                      className="p-4 rounded-2xl glass hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-xl"
                    >
                      {link.platform.toLowerCase().includes('github') ? <Github size={24} /> : <Linkedin size={24} />}
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="pt-4 flex justify-center lg:justify-start items-center gap-3 text-sm font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Available for Innovation & Projects
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[450px] aspect-square shrink-0"
            >
              <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rotate-45 scale-125" />
              <div className="relative h-full w-full overflow-hidden rounded-[64px] border-8 border-white dark:border-white/10 shadow-3xl bg-gray-100 dark:bg-gray-900 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={profile.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-gray-300 font-black italic">Portrait</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Journey Section */}
      <section id="experience" className="relative py-32 overflow-hidden">
        <div className="section-padding container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex flex-col items-center text-center mb-24"
          >
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter drop-shadow-sm">Professional Journey</motion.h2>
            <motion.div variants={itemVariants} className="h-2 w-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative rounded-[40px] glass p-10 border-white/20 dark:border-white/5 transition-all hover:bg-white hover:dark:bg-white/5 hover:border-indigo-500/40 hover:shadow-2xl shadow-indigo-500/10 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="text-indigo-500 -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
                
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/30">
                  <Briefcase size={28} />
                </div>
                <h3 className="text-2xl font-black mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exp.role}</h3>
                <p className="mb-6 font-bold text-gray-500 uppercase tracking-widest text-sm">{exp.company}</p>
                <div className="inline-block px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase text-gray-500 mb-6 border border-gray-200 dark:border-white/10 tracking-widest">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all">
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Aura Decorations */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Advanced Skills Section */}
      <section id="skills" className="relative py-32 overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="section-padding container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex flex-col items-center text-center mb-24"
          >
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Core Competencies</motion.h2>
            <motion.div variants={itemVariants} className="h-2 w-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
            <motion.p variants={itemVariants} className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-sm">Turning complex problems into elegant solutions</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {Object.entries(skillGroups).map(([category, items], i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group p-8 rounded-[40px] glass border-white/20 dark:border-white/5 shadow-xl hover:shadow-indigo-500/10 transition-all"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg">
                    {category.toLowerCase().includes('frontend') ? <Terminal size={24} /> : 
                     category.toLowerCase().includes('backend') ? <Cpu size={24} /> : 
                     category.toLowerCase().includes('database') ? <Layers size={24} /> : <Code2 size={24} />}
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, j) => (
                    <span key={j} className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none -z-10" />
      </section>

      {/* Featured Projects Overhaul */}
      <section id="projects" className="relative py-32">
        <div className="section-padding container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex flex-col items-center text-center mb-24"
          >
            <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">Selected Works</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.4em] text-sm">Where Design Meets Logic</motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid gap-12 md:grid-cols-2"
          >
            {projects.map((project, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -15, scale: 1.01 }}
                className="group relative overflow-hidden rounded-[48px] glass border-white/20 dark:border-white/5 bg-white shadow-2xl hover:shadow-indigo-500/10 transition-all card-hover"
              >
                <div className="p-10 lg:p-14 space-y-8">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.split(',').map((tech, j) => (
                      <span key={j} className="rounded-xl px-4 py-2 bg-indigo-50 dark:bg-white/5 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest border border-indigo-100 dark:border-white/10">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black tracking-tighter leading-none group-hover:text-indigo-600 transition-colors line-clamp-2">{project.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                      {project.description}
                    </p>
                  </div>
                  
                  {project.link && (
                    <motion.a
                      whileHover={{ x: 10 }}
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 font-black text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all text-sm uppercase tracking-widest"
                    >
                      Explore Project <ExternalLink size={18} />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* World-Class Education Section */}
      <section id="education" className="relative py-32 overflow-hidden bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="section-padding container mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid lg:grid-cols-3 gap-16 items-start"
          >
             <div className="lg:col-span-1 space-y-6">
                <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Education</motion.h2>
                <motion.div variants={itemVariants} className="h-2 w-24 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600" />
                <motion.p variants={itemVariants} className="text-gray-500 font-bold uppercase tracking-widest text-sm leading-relaxed">The foundation of every innovative solution is built on academic excellence and continuous learning.</motion.p>
             </div>
             <div className="lg:col-span-2 space-y-16">
                {educations.map((edu, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="relative pl-12 border-l-2 border-indigo-100 dark:border-white/10 group"
                  >
                    <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-white dark:bg-black border-4 border-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                       <h4 className="text-3xl font-black tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{edu.degree}</h4>
                       <span className="shrink-0 px-4 py-2 rounded-full glass border-indigo-500/20 text-xs font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
                        {edu.startDate} – {edu.endDate}
                       </span>
                    </div>
                    <p className="text-xl font-bold text-gray-950 dark:text-gray-200 mb-2">{edu.institution}</p>
                    <p className="text-gray-500 font-medium text-lg italic">{edu.fieldOfStudy}</p>
                  </motion.div>
                ))}
             </div>
          </motion.div>
        </div>
        
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Final Call To Action Integration */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6 max-w-4xl glass rounded-[64px] p-20 text-center border-white/30 aura-glow relative z-10">
           <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
           >
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-gray-950 dark:text-white leading-tight">
                Inspired to Build <br /> Something <span className="text-indigo-600">Legendary?</span>
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                 {verifiedContact ? (
                   <div className="flex flex-wrap justify-center gap-4">
                      {profile.email && (
                        <a href={`mailto:${profile.email}`} className="px-8 py-4 bg-indigo-600 text-white rounded-full font-black flex items-center gap-3 group shadow-xl">
                          <Mail size={22} className="group-hover:rotate-12 transition-transform" /> Say Hello
                        </a>
                      )}
                      {profile.phone && (
                        <a href={`tel:${profile.phone}`} className="px-8 py-4 glass border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-full font-black flex items-center gap-3 shadow-sm">
                          <Phone size={20} /> Let's Talk
                        </a>
                      )}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-8 w-full">
                      <p className="text-gray-500 font-bold text-sm uppercase tracking-widest max-w-md">Verify your details to unlock a direct line of communication</p>
                      <button
                        type="button"
                        onClick={() => setShowPhoneVerification((v) => !v)}
                        className="px-10 py-5 bg-gradient-premium text-white rounded-full font-black text-xl shadow-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-indigo-500/30"
                      >
                        <Lock size={22} /> {showPhoneVerification ? 'Abandon Verification' : 'Start Secure Session'}
                      </button>
                      
                      {showPhoneVerification && (
                         <div className="w-full max-w-lg">
                           <VerificationGate 
                            featureLabel="secure contact protocols" 
                            onVerified={(contact) => {
                              setVerifiedContact(contact);
                              setShowPhoneVerification(false);
                            }} 
                           />
                         </div>
                      )}
                   </div>
                 )}
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  );
}
