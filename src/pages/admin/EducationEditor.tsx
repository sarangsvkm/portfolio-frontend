import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, GraduationCap, Calendar } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Education } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';

export default function EducationEditor() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const { showDialog, dialogElement } = useStatusDialog();

  useEffect(() => {
    resumeService
      .getEducations()
      .then((res) => setEducations(res))
      .catch(() => setEducations(createFallbackResume().educations))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleAdd = () => {
    setEducations([
      { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '' },
      ...educations,
    ]);
  };

  const handleRemove = async (index: number) => {
    const education = educations[index];
    if (!education) return;

    if (!education.id) {
      setEducations(educations.filter((_, i) => i !== index));
      return;
    }

    setDeletingIndex(index);

    try {
      await resumeService.deleteEducation(education.id, authService.getCredentials());
      setEducations(educations.filter((_, i) => i !== index));
      showDialog('success', 'Education Deleted', 'Education deleted successfully.');
    } catch (error) {
      console.error('Error deleting education', error);
      showDialog('error', 'Education Delete Failed', error instanceof Error ? error.message : 'Unable to delete education.');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSave = async (index: number) => {
    const education = educations[index];
    if (!education) return;

    setSavingIndex(index);
    try {
      const savedEducation = await resumeService.saveEducation(education, authService.getCredentials());
      setEducations(educations.map((item, itemIndex) => (itemIndex === index ? savedEducation : item)));
      showDialog('success', 'Education Saved', 'Education saved successfully.');
    } catch (error) {
      console.error('Error saving education', error);
      showDialog('error', 'Education Save Failed', error instanceof Error ? error.message : 'Check the /api/education POST/PUT backend and credentials.');
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
            <GraduationCap className="w-6 h-6 text-purple-600" /> Education Configuration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage degrees, institutions, and study timelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {educations.map((edu, index) => (
          <div key={edu.id || index} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative">
            <button onClick={() => handleRemove(index)} disabled={deletingIndex === index} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
              {deletingIndex === index ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Institution</label>
                <input type="text" value={edu.institution} onChange={(e) => handleChange(index, 'institution', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Degree</label>
                <input type="text" value={edu.degree} onChange={(e) => handleChange(index, 'degree', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Field of Study</label>
                <input type="text" value={edu.fieldOfStudy || ''} onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> Start Date</label>
                <input type="text" value={edu.startDate || ''} onChange={(e) => handleChange(index, 'startDate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> End Date</label>
                <input type="text" value={edu.endDate || ''} onChange={(e) => handleChange(index, 'endDate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={() => handleSave(index)} disabled={savingIndex === index} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50">
                  {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingIndex === index ? 'Saving...' : edu.id ? 'Update Education' : 'Create Education'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {educations.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No education added yet.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
