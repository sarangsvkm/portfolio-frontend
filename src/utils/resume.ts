import type { ResumeViewModel, SocialMediaLink } from '../types';

const defaultSocialLinks: SocialMediaLink[] = [
  { platform: 'GitHub', url: 'https://github.com/sarangsvkm' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarangsvkm' },
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
      name: 'SARANG S',
      title: 'Java Backend Developer',
      about:
        'Java Backend Developer with 2+ years of experience building scalable business applications using Java, Spring Boot, PostgreSQL, and React.js. Strong background in ERP development, REST API design, RBAC security, reporting, and backend performance optimization.',
      email: 'sarangsvkm@gmail.com',
      phone: '+91 7511133612',
      location: 'Alappuzha, Kerala, India',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
      resumeUrl: '',
      socialMediaLinks: defaultSocialLinks,
    },
    skills: [
      { id: 1, name: 'Java', level: 'Advanced' },
      { id: 2, name: 'Spring Boot', level: 'Advanced' },
      { id: 3, name: 'PostgreSQL', level: 'Advanced' },
      { id: 4, name: 'React.js', level: 'Intermediate' },
      { id: 5, name: 'REST APIs', level: 'Advanced' },
      { id: 6, name: 'JasperReports', level: 'Intermediate' },
      { id: 7, name: 'MySQL', level: 'Intermediate' },
      { id: 8, name: 'Python', level: 'Intermediate' },
    ],
    projects: [
      {
        id: 1,
        title: 'Aurix ERP - Jewellery Management System',
        description:
          'Developed ERP modules for billing, inventory management, barcode tracking, credit purchase workflows, daily sales calculations, and operational reporting.',
        techStack: 'Java, Spring Boot, PostgreSQL, JasperReports',
        link: '',
        githubUrl: '',
        imageUrl:
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 2,
        title: 'AurixWeb - Web ERP Application',
        description:
          'Built a web-based ERP platform with modules for item management, sales tracking, and customer management.',
        techStack: 'Spring Boot, PostgreSQL, React.js',
        link: '',
        githubUrl: '',
        imageUrl:
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 3,
        title: 'Payroll and HR Management System',
        description:
          'Developed employee management, payroll processing, HR policy tracking, and employee record modules for business operations.',
        techStack: 'Java, SQL, Backend Architecture',
        link: '',
        githubUrl: '',
        imageUrl:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    experiences: [
      {
        id: 1,
        company: 'Blogtec Software LLP',
        role: 'Software Developer',
        startDate: 'Aug 2023',
        endDate: 'Present',
        description:
          'Developed and maintained jewellery ERP software covering billing, inventory, sales workflows, RBAC security, PostgreSQL integration, and JasperReports-based reporting.',
      },
      {
        id: 2,
        company: 'Kompetenzen Technologies',
        role: 'Full Stack Developer Intern',
        startDate: 'Oct 2022',
        endDate: 'Mar 2023',
        description:
          'Developed Java and JSP-based web modules and supported backend development with SQL database integration.',
      },
      {
        id: 3,
        company: 'Inmakes Learning Hub',
        role: 'Python Full Stack Developer Intern',
        startDate: 'Sep 2022',
        endDate: 'Dec 2022',
        description:
          'Built Python-based web applications and implemented backend functionality with database integration.',
      },
    ],
    educations: [
      {
        id: 1,
        institution: 'Mahaguru Institute of Technology, Kayamkulam',
        degree: 'Bachelor of Technology (B.Tech)',
        fieldOfStudy: 'Computer Science and Engineering',
        startDate: '2018',
        endDate: '2022',
      },
    ],
  };
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
