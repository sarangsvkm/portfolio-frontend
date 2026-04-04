import api from './api';
import type {
  AuthCredentials,
  Education,
  Experience,
  Profile,
  Project,
  ResumeViewModel,
  Skill,
} from '../types';

const ensureCredentials = (auth: AuthCredentials) => {
  if (!auth.username || !auth.password) {
    throw new Error('Missing admin credentials. Please log in again.');
  }
};

const adminHeaders = (auth: AuthCredentials) => ({
  'X-Admin-Username': auth.username,
  'X-Admin-Password': auth.password,
});

const stripId = <T extends { id?: number | string }>(entity: T): Omit<T, 'id'> => {
  const rest = { ...entity };
  delete rest.id;
  return rest;
};

export const resumeService = {
  getResume: async (): Promise<ResumeViewModel> => {
    const response = await api.get<ResumeViewModel>('/api/resume');
    return response.data;
  },

  getProfiles: async (): Promise<Profile[]> => {
    const response = await api.get<Profile[]>('/api/profile');
    return response.data;
  },

  saveProfile: async (profile: Profile, auth: AuthCredentials): Promise<Profile> => {
    ensureCredentials(auth);
    const payload = {
      name: profile.name,
      title: profile.title,
      about: profile.about,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      imageUrl: profile.imageUrl,
      bannerUrl: profile.bannerUrl,
      resumeUrl: profile.resumeUrl,
      socialMediaLinks: profile.socialMediaLinks,
    };

    if (profile.id) {
      const response = await api.put<Profile>(`/api/profile/${profile.id}`, payload, {
        headers: adminHeaders(auth),
      });
      return response.data;
    }

    const response = await api.post<Profile>('/api/profile', payload, {
      headers: adminHeaders(auth),
    });
    return response.data;
  },

  updateProfileAssets: async (
    profileId: number | string,
    profile: Pick<Profile, 'name' | 'imageUrl' | 'bannerUrl' | 'resumeUrl'>,
    auth: AuthCredentials
  ): Promise<Profile> => {
    ensureCredentials(auth);
    const response = await api.put<Profile>(`/api/profile/${profileId}`, profile, {
      headers: adminHeaders(auth),
    });
    return response.data;
  },

  uploadProfileImage: async (profileId: number | string, file: File, auth: AuthCredentials) => {
    ensureCredentials(auth);
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/profile/image/${profileId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...adminHeaders(auth),
      },
    });

    return response.data;
  },

  deleteProfileImage: async (profileId: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/profile/image/${profileId}`, {
      headers: adminHeaders(auth),
    });
  },

  getExperiences: async () => {
    const response = await api.get<Experience[]>('/api/experience');
    return response.data;
  },

  getEducations: async () => {
    const response = await api.get<Education[]>('/api/education');
    return response.data;
  },

  getSkills: async () => {
    const response = await api.get<Skill[]>('/api/skills');
    return response.data;
  },

  getProjects: async () => {
    const response = await api.get<Project[]>('/api/projects');
    return response.data;
  },

  saveExperience: async (experience: Experience, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/experience', experience, auth);
  },

  saveEducation: async (education: Education, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/education', education, auth);
  },

  saveSkill: async (skill: Skill, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/skills', skill, auth);
  },

  saveProject: async (project: Project, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/projects', project, auth);
  },

  saveEntity: async <T extends { id?: number | string }>(
    path: string,
    entity: T,
    auth: AuthCredentials
  ): Promise<T> => {
    ensureCredentials(auth);
    const payload = stripId(entity);

    if (entity.id) {
      const response = await api.put<T>(`${path}/${entity.id}`, payload, {
        headers: adminHeaders(auth),
      });
      return response.data;
    }

    const response = await api.post<T>(path, payload, {
      headers: adminHeaders(auth),
    });
    return response.data;
  },

  deleteExperience: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/experience/${id}`, {
      headers: adminHeaders(auth),
    });
  },

  deleteEducation: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/education/${id}`, {
      headers: adminHeaders(auth),
    });
  },

  deleteSkill: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/skills/${id}`, {
      headers: adminHeaders(auth),
    });
  },

  deleteProject: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/projects/${id}`, {
      headers: adminHeaders(auth),
    });
  },

  deleteSocialLink: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/profile/social/${id}`, {
      headers: adminHeaders(auth),
    });
  },
};
