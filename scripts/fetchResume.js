import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'https://api.sarangsvkm.in/portfolioApi/api/resume';
const OUTPUT_PATH = path.join(__dirname, '../src/utils/resumeData.ts');

async function fetchResume() {
  console.log('Fetching latest resume data from DB...');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    const fileContent = `// This file is auto-generated at build time by scripts/fetchResume.js
export const fallbackResumeData: any = ${JSON.stringify(data, null, 2)};
`;

    fs.writeFileSync(OUTPUT_PATH, fileContent, 'utf-8');
    console.log('Successfully saved DB data to src/utils/resumeData.ts');
  } catch (err) {
    console.error('Failed to fetch DB data, keeping existing or default fallback.', err);
    if (!fs.existsSync(OUTPUT_PATH)) {
      const defaultContent = `export const fallbackResumeData: any = {
  profile: {
    name: 'SARANG S',
    title: 'Java Backend Developer',
    about: 'Java Backend Developer with 2+ years of experience building scalable business applications using Java, Spring Boot, PostgreSQL, and React.js.',
    email: 'sarangsvkm@gmail.com',
    phone: '+91 ••••• ••07',
    location: 'Alappuzha, Kerala, India',
    imageUrl: '/src/assets/images/sarang.jpg',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
    resumeUrl: '',
    socialMediaLinks: [
      { platform: 'GitHub', url: 'https://github.com/sarangsvkm' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/sarangsvkm' }
    ]
  },
  skills: [
    { id: 1, name: 'Java', level: 'Advanced' },
    { id: 2, name: 'Spring Boot', level: 'Advanced' },
    { id: 3, name: 'PostgreSQL', level: 'Advanced' },
    { id: 4, name: 'React.js', level: 'Intermediate' }
  ],
  projects: [],
  experiences: [],
  educations: []
};
`;
      fs.writeFileSync(OUTPUT_PATH, defaultContent, 'utf-8');
    }
  }
}

fetchResume();
