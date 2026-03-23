import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, Calendar, Briefcase } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Experience } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';

export default function ExperienceEditor() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const { showDialog, dialogElement } = useStatusDialog();

  useEffect(() => {
    resumeService
      .getExperiences()
      .then((res) => setExperiences(res))
      .catch(() => setExperiences(createFallbackResume().experiences))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleAdd = () => {
    setExperiences([
      { company: '', role: '', startDate: '', endDate: '', description: '' },
      ...experiences,
    ]);
  };

  const handleRemove = async (index: number) => {
    const experience = experiences[index];
    if (!experience) return;

    if (!experience.id) {
      setExperiences(experiences.filter((_, i) => i !== index));
      return;
    }

    setDeletingIndex(index);

    try {
      await resumeService.deleteExperience(experience.id, authService.getCredentials());
      setExperiences(experiences.filter((_, i) => i !== index));
      showDialog('success', 'Experience Deleted', 'Experience deleted successfully.');
    } catch (error) {
      console.error('Error deleting experience', error);
      showDialog('error', 'Experience Delete Failed', error instanceof Error ? error.message : 'Unable to delete experience.');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSave = async (index: number) => {
    const experience = experiences[index];
    if (!experience) return;
    setSavingIndex(index);

    try {
      const savedExperience = await resumeService.saveExperience(experience, authService.getCredentials());
      setExperiences(experiences.map((item, itemIndex) => (itemIndex === index ? savedExperience : item)));
      showDialog('success', 'Experience Saved', 'Experience saved successfully.');
    } catch (err) {
      console.error('Error saving experience', err);
      showDialog('error', 'Experience Save Failed', err instanceof Error ? err.message : 'Check the /api/experience POST/PUT backend and credentials.');
    } finally {
      setSavingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {dialogElement}
      <div className="max-w-4xl space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-purple-600" /> Experience Configuration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your work history and professional milestones.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {experiences.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No experience added yet.</p>
          </div>
        ) : (
          experiences.map((exp, index) => (
            <div key={exp.id || index} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative group transition-all">
              <button onClick={() => handleRemove(index)} disabled={deletingIndex === index} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50" title="Remove Entry">
                {deletingIndex === index ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company Name</label>
                  <input type="text" value={exp.company} onChange={(e) => handleChange(index, 'company', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g. Google" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Role / Title</label>
                  <input type="text" value={exp.role} onChange={(e) => handleChange(index, 'role', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g. Senior Software Engineer" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date</label>
                  <input type="text" value={exp.startDate || ''} onChange={(e) => handleChange(index, 'startDate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g. Jan 2020" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> End Date</label>
                  <input type="text" value={exp.endDate || ''} onChange={(e) => handleChange(index, 'endDate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g. Present" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description / Responsibilities</label>
                  <textarea rows={4} value={exp.description || ''} onChange={(e) => handleChange(index, 'description', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-y" placeholder="Describe your achievements and tasks..." />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button onClick={() => handleSave(index)} disabled={savingIndex === index} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50">
                    {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingIndex === index ? 'Saving...' : exp.id ? 'Update Experience' : 'Create Experience'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </>
  );
}
