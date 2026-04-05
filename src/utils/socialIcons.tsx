import { 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Youtube, 
  Facebook, 
  Globe, 
  Mail, 
  Phone,
  Link as LinkIcon 
} from 'lucide-react';

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'portfolio', name: 'Portfolio', icon: Globe },
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'phone', name: 'Phone', icon: Phone },
  { id: 'other', name: 'Other', icon: LinkIcon },
];

export function getSocialIcon(platformName: string) {
  const normalized = platformName.toLowerCase();
  
  const platform = SOCIAL_PLATFORMS.find(p => 
    normalized.includes(p.id) || normalized.includes(p.name.toLowerCase())
  );
  
  return platform ? platform.icon : LinkIcon;
}
