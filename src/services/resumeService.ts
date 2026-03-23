import api from './api';
import type {
  AuthCredentials,
  Education,
  Experience,
  Profile,
  ProfileAssetsPayload,
  Project,
  ResumeViewModel,
  Skill,
} from '../types';

type EntityKey = 'profile' | 'experience' | 'education' | 'skill' | 'project';

const ensureCredentials = (auth: AuthCredentials) => {
  if (!auth.username || !auth.password) {
    throw new Error('Missing admin credentials. Please log in again.');
  }
};

const buildPayloadVariants = <T extends Record<string, unknown>>(
  key: EntityKey,
  entity: T,
  auth: AuthCredentials
) => [
  { data: { ...auth, [key]: entity } },
  { data: { ...auth, ...entity } },
  {
    data: entity,
    config: {
      headers: {
        username: auth.username,
        password: auth.password,
      },
    },
  },
];

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
      ...auth,
      profile,
    };
    const profileId = profile.id ?? 1;
    const response = await api.put<Profile>(`/api/profile/${profileId}`, payload);
    return response.data;
  },

  updateProfileAssets: async (
    profileId: number | string,
    profile: Pick<Profile, 'name' | 'imageUrl' | 'bannerUrl' | 'resumeUrl'>,
    auth: AuthCredentials
  ): Promise<Profile> => {
    ensureCredentials(auth);
    const payload: ProfileAssetsPayload = {
      ...auth,
      profile,
    };
    const response = await api.put<Profile>(`/api/profile/${profileId}`, payload);
    return response.data;
  },

  uploadProfileImage: async (profileId: number | string, file: File, auth: AuthCredentials) => {
    ensureCredentials(auth);
    const formData = new FormData();
    formData.append('username', auth.username);
    formData.append('password', auth.password);
    formData.append('file', file);

    const response = await api.post(`/api/profile/image/${profileId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  deleteProfileImage: async (profileId: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/profile/image/${profileId}`, { data: auth });
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
    return resumeService.saveEntity('/api/experience', 'experience', experience, auth);
  },

  saveEducation: async (education: Education, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/education', 'education', education, auth);
  },

  saveSkill: async (skill: Skill, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/skills', 'skill', skill, auth);
  },

  saveProject: async (project: Project, auth: AuthCredentials) => {
    return resumeService.saveEntity('/api/projects', 'project', project, auth);
  },

  saveExperiences: async (experiences: Experience[], auth: AuthCredentials) => {
    return Promise.all(experiences.map((experience) => resumeService.saveExperience(experience, auth)));
  },

  saveEducations: async (educations: Education[], auth: AuthCredentials) => {
    return Promise.all(educations.map((education) => resumeService.saveEducation(education, auth)));
  },

  saveSkills: async (skills: Skill[], auth: AuthCredentials) => {
    return Promise.all(skills.map((skill) => resumeService.saveSkill(skill, auth)));
  },

  saveProjects: async (projects: Project[], auth: AuthCredentials) => {
    return Promise.all(projects.map((project) => resumeService.saveProject(project, auth)));
  },

  saveEntity: async <T extends { id?: number | string }>(
    path: string,
    key: EntityKey,
    entity: T,
    auth: AuthCredentials
  ): Promise<T> => {
    ensureCredentials(auth);
    if (entity.id) {
      const variants = buildPayloadVariants(key, entity as Record<string, unknown>, auth);
      let lastError: unknown;

      for (const variant of variants) {
        try {
          const response = await api.put<T>(`${path}/${entity.id}`, variant.data, variant.config);
          return response.data;
        } catch (error) {
          lastError = error;
          const status = (error as { response?: { status?: number } })?.response?.status;

          if (status !== 400 && status !== 403 && status !== 404) {
            throw error;
          }
        }
      }

      const createVariants = buildPayloadVariants(key, entity as Record<string, unknown>, auth);

      for (const variant of createVariants) {
        try {
          const response = await api.post<T>(path, variant.data, variant.config);
          return response.data;
        } catch (error) {
          lastError = error;
          const status = (error as { response?: { status?: number } })?.response?.status;

          if (status !== 400 && status !== 403 && status !== 404) {
            throw error;
          }
        }
      }

      throw lastError;
    }

    const variants = buildPayloadVariants(key, entity as Record<string, unknown>, auth);
    let lastError: unknown;

    for (const variant of variants) {
      try {
        const response = await api.post<T>(path, variant.data, variant.config);
        return response.data;
      } catch (error) {
        lastError = error;
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status !== 400 && status !== 403) {
          throw error;
        }
      }
    }

    throw lastError;
  },

  deleteExperience: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/experience/${id}`, { data: auth });
  },

  deleteEducation: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/education/${id}`, { data: auth });
  },

  deleteSkill: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/skills/${id}`, { data: auth });
  },

  deleteProject: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/projects/${id}`, { data: auth });
  },

  deleteSocialLink: async (id: number | string, auth: AuthCredentials) => {
    ensureCredentials(auth);
    await api.delete(`/api/profile/social/${id}`, { data: auth });
  },
};
