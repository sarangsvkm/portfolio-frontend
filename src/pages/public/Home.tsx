import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Calendar,
  Briefcase,
  GraduationCap,
  Download,
} from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import type { ResumeViewModel } from '../../types';
import { createFallbackResume, normalizeResume } from '../../utils/resume';
import { resolveAssetUrl } from '../../utils/assetUrl';

export default function PublicHome() {
  const [data, setData] = useState<ResumeViewModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeService
      .getResume()
      .then((res) => setData(normalizeResume(res)))
      .catch((err) => {
        console.warn('API not reachable or returning error. Using fallback data.', err);
        setData(createFallbackResume());
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { profile, skills, projects, experiences, educations } = data;
  const profileImageUrl = resolveAssetUrl(profile.imageUrl);
  const bannerImageUrl = resolveAssetUrl(profile.bannerUrl);
  const resumeUrl = resolveAssetUrl(profile.resumeUrl);
  const githubLink = profile.socialMediaLinks.find((link) => link.platform.toLowerCase() === 'github');
  const linkedinLink = profile.socialMediaLinks.find((link) => link.platform.toLowerCase() === 'linkedin');

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
  };

  return (
    <div className="flex flex-col gap-32 pb-16">
      <section
        className="relative min-h-[52vh] bg-cover bg-center"
        style={bannerImageUrl ? { backgroundImage: `linear-gradient(rgba(8, 15, 35, 0.45), rgba(8, 15, 35, 0.7)), url(${bannerImageUrl})` } : undefined}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-16 md:pt-24 pb-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} id="about" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              {profileImageUrl && (
                <img src={profileImageUrl} alt={profile.name} className="w-28 h-28 md:w-36 md:h-36 rounded-3xl object-cover border-4 border-white/70 shadow-2xl" />
              )}
              <div className="space-y-5 text-white">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05]">
                  Hi, I'm <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-cyan-200 via-white to-indigo-200 bg-clip-text text-transparent">{profile.name}</span>
                </h1>
                <h2 className="text-xl md:text-3xl font-semibold text-slate-100">{profile.title}</h2>
              </div>
            </div>

            <p className="text-lg md:text-2xl text-slate-100/90 leading-relaxed max-w-3xl">{profile.about}</p>

            <div className="flex flex-wrap gap-4 pt-2 text-sm font-medium text-slate-100">
              {profile.location && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                  <MapPin className="w-4 h-4 text-cyan-200" /> {profile.location}
                </div>
              )}
              {profile.email && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full">
                  <Mail className="w-4 h-4 text-cyan-200" /> {profile.email}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {githubLink?.url && (
                <a href={githubLink.url} target="_blank" rel="noreferrer" className="p-4 bg-slate-950 text-white rounded-full hover:scale-110 transition-transform shadow-lg">
                  <Github className="w-6 h-6" />
                </a>
              )}
              {linkedinLink?.url && (
                <a href={linkedinLink.url} target="_blank" rel="noreferrer" className="p-4 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                  <Linkedin className="w-6 h-6" />
                </a>
              )}
              {resumeUrl && (
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-full font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                  <Download className="w-5 h-5" /> View Resume
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col gap-32">
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeIn} id="skills">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Skills Focus</h2>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
          </div>
          <div className="flex flex-wrap gap-4">
            {skills.map((skill, index) => (
              <motion.div key={skill.id || index} whileHover={{ scale: 1.05, y: -2 }} className="px-5 py-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="font-semibold">{skill.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{skill.level}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeIn} id="projects">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Featured Projects</h2>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <motion.div whileHover={{ y: -8 }} key={project.id || i} className="group flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600/50 transition-all duration-300">
                {project.imageUrl && <img src={resolveAssetUrl(project.imageUrl)} alt={project.title} className="h-48 w-full object-cover" />}
                <div className="p-8">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{project.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {(project.techStack || '')
                      .split(',')
                      .filter(Boolean)
                      .map((tech, j) => (
                        <span key={j} className="text-xs font-bold px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg border border-purple-100 dark:border-purple-800/30">
                          {tech.trim()}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center gap-6 mt-auto pt-6 border-t border-gray-100 dark:border-gray-800/50">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-2 transition-colors">
                        <Github className="w-5 h-5" /> Source
                      </a>
                    )}
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 transition-colors">
                        <ExternalLink className="w-5 h-5" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {experiences.length > 0 && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeIn} id="experience">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Experience</h2>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
            </div>
            <div className="space-y-12 pl-6 md:pl-8 border-l-2 border-purple-200 dark:border-purple-900/50">
              {experiences.map((exp, i) => (
                <div key={exp.id || i} className="relative pl-8">
                  <span className="absolute -left-[45px] top-0 p-2 bg-white dark:bg-gray-950 border-2 border-purple-300 dark:border-purple-700 rounded-full text-purple-600 dark:text-purple-400 shadow-sm">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{exp.role}</h3>
                      <h4 className="text-lg font-medium text-purple-600 dark:text-purple-400 mt-1">{exp.company}</h4>
                    </div>
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 md:mt-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <Calendar className="w-4 h-4" />
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line mt-4 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {educations.length > 0 && (
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={fadeIn} id="education">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Education</h2>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
            </div>
            <div className="space-y-6">
              {educations.map((edu, i) => (
                <div key={edu.id || i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start md:items-center gap-6">
                    <div className="hidden md:flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl shrink-0">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-purple-600 md:hidden" />
                        {edu.institution}
                      </h3>
                      <p className="text-lg text-purple-600 dark:text-purple-400 font-medium">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full shrink-0">
                    <Calendar className="w-4 h-4" />
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}


