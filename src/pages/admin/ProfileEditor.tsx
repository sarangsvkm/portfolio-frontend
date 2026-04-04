import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Profile } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';

const PUBLIC_RESUME_CACHE_KEY = 'public_resume_cache';

export default function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showDialog, dialogElement } = useStatusDialog();

  useEffect(() => {
    resumeService
      .getProfiles()
      .then((res) => setProfile(res[0] ?? createFallbackResume().profile))
      .catch(() => setProfile(createFallbackResume().profile))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
    if (!profile) return;
    const socialMediaLinks = [...profile.socialMediaLinks];
    socialMediaLinks[index] = { ...socialMediaLinks[index], [field]: value };
    setProfile({ ...profile, socialMediaLinks });
  };

  const addSocialLink = () => {
    if (!profile) return;
    setProfile({
      ...profile,
      socialMediaLinks: [...profile.socialMediaLinks, { platform: '', url: '' }],
    });
  };

  const removeSocialLink = (index: number) => {
    if (!profile) return;
    setProfile({
      ...profile,
      socialMediaLinks: profile.socialMediaLinks.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      const sanitizedProfile = {
        ...profile,
        socialMediaLinks: profile.socialMediaLinks
          .map((link) => ({
            ...link,
            platform: link.platform.trim(),
            url: link.url.trim(),
          }))
          .filter((link) => link.platform || link.url),
      };

      const savedProfile = await resumeService.saveProfile(sanitizedProfile, authService.getCredentials());
      setProfile(savedProfile);

      const cached = localStorage.getItem(PUBLIC_RESUME_CACHE_KEY);

      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { profile?: Profile };
          localStorage.setItem(
            PUBLIC_RESUME_CACHE_KEY,
            JSON.stringify({
              ...parsed,
              profile: savedProfile,
            })
          );
        } catch {
          localStorage.removeItem(PUBLIC_RESUME_CACHE_KEY);
        }
      }

      showDialog('success', 'Profile Saved', 'Profile saved successfully.');
    } catch (error) {
      console.error('Error saving profile', error);
      showDialog('error', 'Profile Save Failed', 'Check the /api/profile backend and credentials.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {dialogElement}
      <div className="max-w-6xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Configuration</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage personal details and social links here. Images and logo now live in the separate Images section.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professional Title</label>
              <input type="text" name="title" value={profile.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Professional About</label>
            <textarea name="about" rows={5} value={profile.about} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-y" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Location</label>
              <input type="text" name="location" value={profile.location} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Links</h3>
              <button onClick={addSocialLink} className="text-sm text-purple-600 hover:text-purple-700 font-semibold">
                + Add Social Link
              </button>
            </div>

            <div className="space-y-4">
              {profile.socialMediaLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => handleSocialChange(index, 'platform', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                    placeholder="Platform"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialChange(index, 'url', e.target.value)}
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white outline-none"
                    placeholder="https://..."
                  />
                  <button onClick={() => removeSocialLink(index)} className="md:col-span-3 justify-self-start text-sm text-red-500 hover:text-red-600">
                    Remove Link
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
