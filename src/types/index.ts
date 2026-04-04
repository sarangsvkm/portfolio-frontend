export interface SocialMediaLink {
  id?: number | string;
  platform: string;
  url: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface UploadedAsset {
  id?: number | string;
  name?: string;
  type?: string;
  data?: string;
}

export interface Profile {
  id?: number | string;
  name: string;
  title: string;
  about: string;
  email: string;
  phone: string;
  location: string;
  imageUrl?: string;
  bannerUrl?: string;
  resumeUrl?: string;
  profileImage?: UploadedAsset | null;
  bannerImage?: UploadedAsset | null;
  socialMediaLinks: SocialMediaLink[];
}

export interface Skill {
  id?: number | string;
  name: string;
  level: string;
  category?: string;
}

export interface Project {
  id?: number | string;
  title: string;
  description: string;
  techStack: string;
  imageUrl?: string;
  githubUrl?: string;
  link?: string;
}

export interface Experience {
  id?: number | string;
  company: string;
  role: string;
  startDate?: string;
  endDate?: string | null;
  description?: string;
}

export interface Education {
  id?: number | string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeViewModel {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
}

export interface ResumeSavePayload {
  username: string;
  password: string;
  resume: ResumeViewModel;
}

export interface ProfileAssetsPayload {
  username: string;
  password: string;
  profile: Pick<Profile, 'name' | 'imageUrl' | 'bannerUrl' | 'resumeUrl'>;
}

export interface OtpRequest {
  name: string;
  email: string;
  phone: string;
}

export interface OtpVerification {
  email: string;
  otp: string;
}

export interface ContactRequest {
  id?: number | string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  verified?: boolean;
  createdAt?: string;
  date?: string;
  time?: string;
}

export interface SystemConfig {
  id?: number | string;
  configKey: string;
  configValue: string;
}
