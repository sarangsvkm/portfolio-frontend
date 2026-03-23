import { useEffect, useState } from 'react';
import { Briefcase, FolderGit2, GraduationCap, Sparkles, UserRound } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { createFallbackResume, normalizeResume } from '../../utils/resume';
import type { ResumeViewModel } from '../../types';

const cards = [
  { key: 'profile', label: 'Profile Ready', icon: UserRound },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'skills', label: 'Skills', icon: Sparkles },
  { key: 'experiences', label: 'Experience Entries', icon: Briefcase },
  { key: 'educations', label: 'Education Entries', icon: GraduationCap },
] as const;

export default function AdminDashboard() {
  const [resume, setResume] = useState<ResumeViewModel | null>(null);

  useEffect(() => {
    resumeService
      .getResume()
      .then((res) => setResume(normalizeResume(res)))
      .catch(() => setResume(createFallbackResume()));
  }, []);

  if (!resume) {
    return <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>;
  }

  const stats = {
    profile: resume.profile.name ? 'Yes' : 'No',
    projects: String(resume.projects.length),
    skills: String(resume.skills.length),
    experiences: String(resume.experiences.length),
    educations: String(resume.educations.length),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-2">Welcome to CMS Admin</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The dashboard is now backed by the updated resume API collection. Use the sidebar to edit each section and publish the full resume payload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.key} className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</h3>
              <card.icon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-3">{stats[card.key]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Public Snapshot</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{resume.profile.about || 'No about text saved yet.'}</p>
      </div>
    </div>
  );
}
