import type { ResumeViewModel } from '../types';
import { fallbackResumeData } from './resumeData';

export function createEmptyResume(): ResumeViewModel {
  return {
    profile: {
      name: '',
      title: '',
      about: '',
      email: '',
      phone: '',
      location: '',
      imageUrl: '',
      bannerUrl: '',
      resumeUrl: '',
      socialMediaLinks: [],
    },
    skills: [],
    projects: [],
    experiences: [],
    educations: [],
  };
}

export function createFallbackResume(): ResumeViewModel {
  return normalizeResume(fallbackResumeData);
}

const cleanText = (value?: string | null) =>
  (value ?? '')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .trim();

const formatDateLabel = (value?: string | null) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-');
    const date = new Date(`${year}-${month}-01T00:00:00`);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    }
  }

  return value;
};

export function normalizeResume(resume?: Partial<ResumeViewModel> | null): ResumeViewModel {
  const base = createEmptyResume();
  const profile = resume?.profile;

  return {
    profile: {
      ...base.profile,
      ...profile,
      name: cleanText(profile?.name) || base.profile.name,
      title: cleanText(profile?.title) || base.profile.title,
      about: cleanText(profile?.about) || base.profile.about,
      email: cleanText(profile?.email) || base.profile.email,
      phone: cleanText(profile?.phone) || base.profile.phone,
      location: cleanText(profile?.location) || base.profile.location,
      imageUrl: cleanText(profile?.imageUrl) || '',
      bannerUrl: cleanText(profile?.bannerUrl) || '',
      resumeUrl: cleanText(profile?.resumeUrl) || '',
      socialMediaLinks:
        profile?.socialMediaLinks?.map((link) => ({
          ...link,
          platform: cleanText(link.platform),
          url: cleanText(link.url),
        })) ?? base.profile.socialMediaLinks,
    },
    skills:
      resume?.skills?.map((skill) => ({
        ...skill,
        name: cleanText(skill.name),
        level: cleanText(skill.level),
      })) ?? base.skills,
    projects:
      resume?.projects?.map((project) => {
        const link = cleanText(project.link);
        const githubUrl = cleanText(project.githubUrl);

        return {
          ...project,
          title: cleanText(project.title),
          description: cleanText(project.description),
          techStack: cleanText(project.techStack),
          imageUrl: cleanText(project.imageUrl),
          link,
          githubUrl: githubUrl || (link.toLowerCase().includes('github.com') ? link : ''),
        };
      }) ?? base.projects,
    experiences:
      resume?.experiences?.map((experience) => ({
        ...experience,
        company: cleanText(experience.company),
        role: cleanText(experience.role),
        startDate: formatDateLabel(experience.startDate),
        endDate: experience.endDate === 'Present' ? 'Present' : formatDateLabel(experience.endDate),
        description: cleanText(experience.description),
      })) ?? base.experiences,
    educations:
      resume?.educations?.map((education) => ({
        ...education,
        degree: cleanText(education.degree),
        institution: cleanText(education.institution),
        fieldOfStudy: cleanText(education.fieldOfStudy),
        startDate: formatDateLabel(education.startDate),
        endDate: formatDateLabel(education.endDate),
      })) ?? base.educations,
  };
}
