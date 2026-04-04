import { useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Save, Trash2, Upload } from 'lucide-react';
import { authService } from '../../services/authService';
import { configService } from '../../services/configService';
import { resumeService } from '../../services/resumeService';
import type { Profile, SystemConfig } from '../../types';
import { useStatusDialog } from '../../hooks/useStatusDialog';
import { createFallbackResume } from '../../utils/resume';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { ImageCropModal } from '../../components/admin/ImageCropModal';

const RESUME_SHOW_PROFILE_IMAGE_KEY = 'site.resumeShowProfileImage';
const RESUME_WITHOUT_IMAGE_URL_KEY = 'site.resumeWithoutImageUrl';

export default function ImageSettings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAssets, setSavingAssets] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSaving, setLogoSaving] = useState(false);
  const [logoName, setLogoName] = useState('Portfolio');
  const [logoImageUrl, setLogoImageUrl] = useState('');
  const [logoImageConfig, setLogoImageConfig] = useState<SystemConfig | null>(null);
  const [logoNameConfig, setLogoNameConfig] = useState<SystemConfig | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSaving, setResumeSaving] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState('');
  const [resumeImageConfig, setResumeImageConfig] = useState<SystemConfig | null>(null);
  const [showResumeProfileImage, setShowResumeProfileImage] = useState(() => {
    const saved = localStorage.getItem(RESUME_SHOW_PROFILE_IMAGE_KEY);
    return saved === null ? true : saved === 'true';
  });
  const [resumeWithoutImageUrl, setResumeWithoutImageUrl] = useState(() =>
    localStorage.getItem(RESUME_WITHOUT_IMAGE_URL_KEY) || ''
  );
  const { showDialog, dialogElement } = useStatusDialog();
  const [profileCropFileSrc, setProfileCropFileSrc] = useState<string | null>(null);
  const [logoCropFileSrc, setLogoCropFileSrc] = useState<string | null>(null);
  const [resumeCropFileSrc, setResumeCropFileSrc] = useState<string | null>(null);

  useEffect(() => {
    resumeService
      .getProfiles()
      .then((profiles) => setProfile(profiles[0] ?? createFallbackResume().profile))
      .catch(() => setProfile(createFallbackResume().profile))
      .finally(() => setLoading(false));

    configService
      .getConfigs(authService.getCredentials())
      .then((configs) => {
        const existingLogoImage = configs.find((config) => config.configKey === 'site.logoImageUrl') ?? null;
        const existingLogoName = configs.find((config) => config.configKey === 'site.logoName') ?? null;
        const existingResumeImage = configs.find((config) => config.configKey === 'site.resumeProfileImageUrl') ?? null;
        setLogoImageConfig(existingLogoImage);
        setLogoNameConfig(existingLogoName);
        setResumeImageConfig(existingResumeImage);
        setLogoImageUrl(existingLogoImage?.configValue ?? '');
        setLogoName(existingLogoName?.configValue ?? 'Portfolio');
        setResumeImageUrl(existingResumeImage?.configValue ?? '');
      })
      .catch(() => null);
  }, []);

  const handleAssetFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const objectUrl = URL.createObjectURL(file);
    setProfileCropFileSrc(objectUrl);
    e.target.value = '';
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!profile) return;

    setProfileCropFileSrc(null);
    setUploadingProfile(true);

    try {
      const auth = authService.getCredentials();
      const savedProfile = profile.id ? profile : await resumeService.saveProfile(profile, auth);

      await resumeService.uploadProfileImage(savedProfile.id ?? 1, file, auth);
      setProfile({
        ...savedProfile,
        imageUrl: `/api/profile/image/${savedProfile.id ?? 1}`,
      });
      showDialog('success', 'Image Uploaded', 'Profile image uploaded successfully.');
    } catch (error) {
      console.error('Error uploading profile image', error);
      showDialog('error', 'Upload Failed', 'Image upload failed. Check backend and try again.');
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleProfileImageDelete = async () => {
    if (!profile?.id) return;

    setDeletingProfile(true);

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
      setDeletingProfile(false);
    }
  };

  const handleAssetSave = async () => {
    if (!profile) return;

    setSavingAssets(true);

    try {
      const auth = authService.getCredentials();
      const savedProfile = await resumeService.saveProfile(profile, auth);
      const updatedProfile = await resumeService.updateProfileAssets(
        savedProfile.id ?? 1,
        {
          name: savedProfile.name,
          imageUrl: profile.imageUrl,
          bannerUrl: profile.bannerUrl,
          resumeUrl: profile.resumeUrl,
        },
        auth
      );
      setProfile((current) => (current ? { ...current, ...updatedProfile } : updatedProfile));
      localStorage.setItem(RESUME_SHOW_PROFILE_IMAGE_KEY, String(showResumeProfileImage));
      localStorage.setItem(RESUME_WITHOUT_IMAGE_URL_KEY, resumeWithoutImageUrl.trim());
      showDialog('success', 'Assets Saved', 'Resume with image, resume without image, and resume photo preference saved successfully.');
    } catch (error) {
      console.error('Error saving profile assets', error);
      showDialog('error', 'Save Failed', 'Check the /api/profile backend and credentials.');
    } finally {
      setSavingAssets(false);
    }
  };

  const handleLogoImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setLogoCropFileSrc(objectUrl);
    e.target.value = '';
  };

  const handleLogoActualUpload = async (file: File) => {
    setLogoCropFileSrc(null);
    setLogoUploading(true);

    try {
      const fileUrl = await configService.uploadAsset(file);
      setLogoImageUrl(fileUrl);
      showDialog('success', 'Logo Uploaded', 'Logo image uploaded successfully. Save to apply it.');
    } catch (error) {
      console.error('Error uploading logo image', error);
      showDialog('error', 'Logo Upload Failed', 'Unable to upload logo image.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoSave = async () => {
    setLogoSaving(true);

    try {
      const auth = authService.getCredentials();
      const savedLogoName = await configService.saveConfig(
        {
          id: logoNameConfig?.id,
          configKey: 'site.logoName',
          configValue: logoName,
        },
        auth
      );

      const savedLogoImage = await configService.saveConfig(
        {
          id: logoImageConfig?.id,
          configKey: 'site.logoImageUrl',
          configValue: logoImageUrl,
        },
        auth
      );

      setLogoNameConfig(savedLogoName);
      setLogoImageConfig(savedLogoImage);
      localStorage.setItem('site.logoName', savedLogoName.configValue);
      localStorage.setItem('site.logoImageUrl', savedLogoImage.configValue);
      showDialog('success', 'Logo Saved', 'Logo name and logo image saved successfully.');
    } catch (error) {
      console.error('Error saving logo config', error);
      showDialog('error', 'Logo Save Failed', 'Unable to save logo configuration.');
    } finally {
      setLogoSaving(false);
    }
  };

  const handleLogoDelete = async () => {
    setLogoSaving(true);

    try {
      const auth = authService.getCredentials();

      if (logoImageConfig?.id) {
        await configService.deleteConfig(logoImageConfig.id, auth);
      }

      setLogoImageConfig(null);
      setLogoImageUrl('');
      localStorage.removeItem('site.logoImageUrl');
      showDialog('success', 'Logo Deleted', 'Logo image configuration deleted successfully.');
    } catch (error) {
      console.error('Error deleting logo config', error);
      showDialog('error', 'Logo Delete Failed', 'Unable to delete logo image configuration.');
    } finally {
      setLogoSaving(false);
    }
  };

  const handleResumeImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setResumeCropFileSrc(objectUrl);
    e.target.value = '';
  };

  const handleResumeActualUpload = async (file: File) => {
    setResumeCropFileSrc(null);
    setResumeUploading(true);

    try {
      const fileUrl = await configService.uploadAsset(file);
      setResumeImageUrl(fileUrl);
      showDialog('success', 'Resume Photo Uploaded', 'Resume photo uploaded successfully. Save it below.');
    } catch (error) {
      console.error('Error uploading resume image', error);
      showDialog('error', 'Upload Failed', 'Unable to upload resume image.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeSave = async () => {
    setResumeSaving(true);

    try {
      const auth = authService.getCredentials();
      const savedResumeImage = await configService.saveConfig(
        {
          id: resumeImageConfig?.id,
          configKey: 'site.resumeProfileImageUrl',
          configValue: resumeImageUrl,
        },
        auth
      );

      setResumeImageConfig(savedResumeImage);
      localStorage.setItem('site.resumeProfileImageUrl', savedResumeImage.configValue);
      showDialog('success', 'Resume Photo Saved', 'Resume profile image saved successfully.');
    } catch (error) {
      console.error('Error saving resume config', error);
      showDialog('error', 'Save Failed', 'Unable to save resume image configuration.');
    } finally {
      setResumeSaving(false);
    }
  };

  const handleResumeDelete = async () => {
    setResumeSaving(true);

    try {
      const auth = authService.getCredentials();

      if (resumeImageConfig?.id) {
        await configService.deleteConfig(resumeImageConfig.id, auth);
      }

      setResumeImageConfig(null);
      setResumeImageUrl('');
      localStorage.removeItem('site.resumeProfileImageUrl');
      showDialog('success', 'Resume Photo Deleted', 'Resume image configuration deleted successfully.');
    } catch (error) {
      console.error('Error deleting resume config', error);
      showDialog('error', 'Delete Failed', 'Unable to delete resume image configuration.');
    } finally {
      setResumeSaving(false);
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage profile image, banner image, resume download links, and header logo in one separate section.
            </p>
          </div>
          <button
            onClick={handleAssetSave}
            disabled={savingAssets}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {savingAssets ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingAssets ? 'Saving...' : 'Save Image Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Assets</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload your main photo and set the banner and two resume download URLs used by the public site.
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
                {uploadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Profile Image
                <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageSelect} />
              </label>

              {profile.imageUrl && (
                <button onClick={handleProfileImageDelete} disabled={deletingProfile} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-300 rounded-xl transition-colors disabled:opacity-50">
                  {deletingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Profile Image
                </button>
              )}
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
                <input type="text" name="imageUrl" value={profile.imageUrl || ''} onChange={handleAssetFieldChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/profile/image/1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Banner URL</label>
                <input type="text" name="bannerUrl" value={profile.bannerUrl || ''} onChange={handleAssetFieldChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/banner.jpg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resume URL With Image</label>
                <input type="text" name="resumeUrl" value={profile.resumeUrl || ''} onChange={handleAssetFieldChange} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/resume-with-image.pdf" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resume URL Without Image</label>
                <input type="text" value={resumeWithoutImageUrl} onChange={(e) => setResumeWithoutImageUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/resume-without-image.pdf" />
              </div>
              <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showResumeProfileImage}
                  onChange={(e) => setShowResumeProfileImage(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  <span className="block font-semibold text-gray-900 dark:text-white">Show profile picture in HTML resume preview</span>
                  <span className="block text-gray-500 dark:text-gray-400">This controls the built-in HTML preview when no PDF resume is opened.</span>
                </span>
              </label>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Logo Section</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Upload the site logo, save a logo name, and show both in the public header.
                </p>
              </div>
            </div>

            {logoImageUrl ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Current Logo Preview</p>
                <img src={resolveAssetUrl(logoImageUrl)} alt="Logo preview" className="h-14 object-contain" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 text-sm text-center text-gray-500 dark:text-gray-400">
                No logo image selected yet.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo Name</label>
              <input type="text" value={logoName} onChange={(e) => setLogoName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Portfolio" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Logo Image URL</label>
              <input type="text" value={logoImageUrl} onChange={(e) => setLogoImageUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/logo.png" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                {logoUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Logo Image
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoImageSelect} />
              </label>

              <button onClick={handleLogoSave} disabled={logoSaving} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors disabled:opacity-50">
                {logoSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Logo
              </button>

              {logoImageUrl && (
                <button onClick={handleLogoDelete} disabled={logoSaving} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-300 rounded-xl transition-colors disabled:opacity-50">
                  {logoSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Logo
                </button>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resume Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Upload an alternative photo to be strictly used when generating your ATS resumes or LaTeX sources.
                </p>
              </div>
            </div>

            {resumeImageUrl ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Current Resume Photo</p>
                <img src={resolveAssetUrl(resumeImageUrl)} alt="Resume photo preview" className="w-24 h-24 object-cover rounded-2xl border border-gray-200 dark:border-gray-700" />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900 text-sm text-center text-gray-500 dark:text-gray-400">
                No resume photo selected yet.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resume Image URL</label>
              <input type="text" value={resumeImageUrl} onChange={(e) => setResumeImageUrl(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="/api/upload/view/resume-photo.jpg" />
            </div>

            <div className="flex flex-col gap-3">
              <label className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
                {resumeUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Resume Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleResumeImageSelect} />
              </label>

              <button onClick={handleResumeSave} disabled={resumeSaving} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50">
                {resumeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Resume Photo
              </button>

              {resumeImageUrl && (
                <button onClick={handleResumeDelete} disabled={resumeSaving} className="inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-300 rounded-xl transition-colors disabled:opacity-50">
                  {resumeSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Resume Photo
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      {profileCropFileSrc && (
        <ImageCropModal
          imageSrc={profileCropFileSrc}
          aspect={1}
          onCropComplete={handleProfileImageUpload}
          onCancel={() => setProfileCropFileSrc(null)}
        />
      )}
      {logoCropFileSrc && (
        <ImageCropModal
          imageSrc={logoCropFileSrc}
          aspect={undefined}
          onCropComplete={handleLogoActualUpload}
          onCancel={() => setLogoCropFileSrc(null)}
        />
      )}
      {resumeCropFileSrc && (
        <ImageCropModal
          imageSrc={resumeCropFileSrc}
          aspect={1}
          onCropComplete={handleResumeActualUpload}
          onCancel={() => setResumeCropFileSrc(null)}
        />
      )}
    </>
  );
}
