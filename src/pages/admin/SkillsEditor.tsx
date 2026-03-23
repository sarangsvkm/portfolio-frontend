import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, Sparkles } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Skill } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';

export default function SkillsEditor() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showDialog, dialogElement } = useStatusDialog();

  useEffect(() => {
    resumeService
      .getSkills()
      .then((res) => setSkills(res))
      .catch(() => setSkills(createFallbackResume().skills))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index: number, field: keyof Skill, value: string) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleAdd = () => {
    setSkills([{ name: '', level: '' }, ...skills]);
  };

  const handleRemove = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await resumeService.saveSkills(skills, authService.getCredentials());
      showDialog('success', 'Skills Saved', 'Skills saved successfully.');
    } catch (error) {
      console.error('Error saving skills', error);
      showDialog('error', 'Skills Save Failed', 'Check the /api/skills POST/PUT backend and credentials.');
    } finally {
      setSaving(false);
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
            <Sparkles className="w-6 h-6 text-purple-600" /> Skills Configuration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage the stack and proficiency levels exposed by the resume API.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add New
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={skill.id || index} className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_auto] gap-4 items-end bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Skill Name</label>
              <input type="text" value={skill.name} onChange={(e) => handleChange(index, 'name', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Level</label>
              <input type="text" value={skill.level} onChange={(e) => handleChange(index, 'level', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Advanced" />
            </div>
            <button onClick={() => handleRemove(index)} className="h-12 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No skills added yet.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
