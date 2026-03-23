import { useEffect, useState } from 'react';
import { Save, Loader2, Upload, Trash2 } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Profile } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';
import { resolveAssetUrl } from '../../utils/assetUrl';

export default function ProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;

    setUploading(true);

    try {
      await resumeService.uploadProfileImage(profile.id ?? 1, e.target.files[0], authService.getCredentials());
      setProfile({
        ...profile,
        imageUrl: `/api/profile/image/${profile.id ?? 1}`,
      });
      showDialog('success', 'Image Uploaded', 'Profile image uploaded successfully.');
    } catch (error) {
      console.error('Error uploading profile image', error);
      showDialog('error', 'Upload Failed', 'Image upload failed. Check backend and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!profile?.id) return;

    setDeletingImage(true);

    try {
      await resumeService.deleteProfileImage(profile.id, authService.getCredentials());
      setProfile({
        ...profile,
        imageUrl: '',
      });
      showDialog('success', 'Image Deleted', 'Profile image deleted successfully.');
    } catch (error) {
      console.error('Error deleting profile image', error);
      showDialog('error', 'Delete Failed', 'Unable to delete profile image.');
    } finally {
      setDeletingImage(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);

    try {
      await resumeService.saveProfile(profile, authService.getCredentials());
      await resumeService
        .updateProfileAssets(
          profile.id ?? 1,
          {
            name: profile.name,
            imageUrl: profile.imageUrl,
            bannerUrl: profile.bannerUrl,
            resumeUrl: profile.resumeUrl,
          },
          authService.getCredentials()
        )
        .catch(() => null);
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
              Manage profile details on the left and image assets in a separate admin panel on the right.
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

        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 items-start">
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

          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6 xl:sticky xl:top-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Image Panel</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage profile image, banner image, and resume asset URLs separately from the main profile form.
              </p>
            </div>

            {profile.imageUrl ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Current Profile Image</p>
                <img src={resolveAssetUrl(profile.imageUrl)} alt="Profile preview" className="w-32 h-32 rounded-2xl object-cover border border-gray-200 dark:border-gray-700" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 text-sm text-center text-gray-500 dark:text-gray-400">
                No profile image uploaded yet.
              </div>
            )}

            <div className="flex flex-col gap-3">
              <label className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Profile Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              {profile.imageUrl && (
                <button onClick={handleImageDelete} disabled={deletingImage} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-300 rounded-xl transition-colors disabled:opacity-50">
                  {deletingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Image
                </button>
              )}
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
                <input type="text" name="imageUrl" value={profile.imageUrl || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/profile/image/1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Banner URL</label>
                <input type="text" name="bannerUrl" value={profile.bannerUrl || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resume URL</label>
                <input type="text" name="resumeUrl" value={profile.resumeUrl || ''} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/resume.pdf" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
