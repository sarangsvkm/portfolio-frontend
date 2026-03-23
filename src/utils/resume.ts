import type { ResumeViewModel, SocialMediaLink } from '../types';

const defaultSocialLinks: SocialMediaLink[] = [
  { platform: 'GitHub', url: 'https://github.com' },
  { platform: 'LinkedIn', url: 'https://linkedin.com' },
];

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
  return {
    profile: {
      name: 'Sarang',
      title: 'Full Stack Developer',
      about:
        'Developed a full-stack portfolio management system using React (Vite) and Spring Boot, featuring a CMS-style admin dashboard, View Model API architecture, and dynamic content rendering with real-time preview.',
      email: 'hello@sarangsvkm.in',
      phone: '+91 00000 00000',
      location: 'India',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
      resumeUrl: '',
      socialMediaLinks: defaultSocialLinks,
    },
    skills: [
      { id: 1, name: 'React', level: 'Advanced' },
      { id: 2, name: 'TypeScript', level: 'Advanced' },
      { id: 3, name: 'Tailwind CSS', level: 'Advanced' },
      { id: 4, name: 'Spring Boot', level: 'Advanced' },
      { id: 5, name: 'PostgreSQL', level: 'Intermediate' },
      { id: 6, name: 'Framer Motion', level: 'Intermediate' },
    ],
    projects: [
      {
        id: 1,
        title: 'Portfolio CMS System',
        description:
          'A full-stack developer portfolio platform that allows users to showcase their profile while managing content through a Spring Boot CMS backend.',
        techStack: 'React, Vite, Spring Boot, Tailwind CSS',
        link: '#',
        githubUrl: '#',
        imageUrl:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    experiences: [
      {
        id: 1,
        company: 'Open Source Contributor',
        role: 'Full Stack Developer',
        startDate: '2023',
        endDate: 'Present',
        description:
          'Designed backend APIs with Spring Boot and crafted interactive frontend UI with React and Tailwind.',
      },
    ],
    educations: [
      {
        id: 1,
        institution: 'Example University',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science',
        startDate: '2018',
        endDate: '2022',
      },
    ],
  };
}

export function normalizeResume(resume?: Partial<ResumeViewModel> | null): ResumeViewModel {
  const base = createEmptyResume();

  return {
    profile: {
      ...base.profile,
      ...resume?.profile,
      socialMediaLinks: resume?.profile?.socialMediaLinks ?? base.profile.socialMediaLinks,
    },
    skills: resume?.skills ?? base.skills,
    projects: resume?.projects ?? base.projects,
    experiences: resume?.experiences ?? base.experiences,
    educations: resume?.educations ?? base.educations,
  };
}
