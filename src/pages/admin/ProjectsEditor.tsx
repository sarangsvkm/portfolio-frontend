import { useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, FolderGit2, Link2, Github } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { authService } from '../../services/authService';
import type { Project } from '../../types';
import { createFallbackResume } from '../../utils/resume';
import { useStatusDialog } from '../../hooks/useStatusDialog';

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const { showDialog, dialogElement } = useStatusDialog();

  useEffect(() => {
    resumeService
      .getProjects()
      .then((res) => setProjects(res))
      .catch(() => setProjects(createFallbackResume().projects))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const handleAdd = () => {
    setProjects([
      { title: '', description: '', techStack: '', githubUrl: '', link: '', imageUrl: '' },
      ...projects,
    ]);
  };

  const handleRemove = async (index: number) => {
    const project = projects[index];

    if (!project) return;

    if (!project.id) {
      setProjects(projects.filter((_, i) => i !== index));
      return;
    }

    setDeletingIndex(index);

    try {
      await resumeService.deleteProject(project.id, authService.getCredentials());
      setProjects(projects.filter((_, i) => i !== index));
      showDialog('success', 'Project Deleted', 'Project deleted successfully.');
    } catch (error) {
      console.error('Error deleting project', error);
      showDialog('error', 'Project Delete Failed', error instanceof Error ? error.message : 'Unable to delete project.');
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleSave = async (index: number) => {
    const project = projects[index];
    if (!project) return;

    setSavingIndex(index);
    try {
      const savedProject = await resumeService.saveProject(project, authService.getCredentials());
      setProjects(projects.map((item, itemIndex) => (itemIndex === index ? savedProject : item)));
      showDialog('success', 'Projects Saved', 'Projects saved successfully.');
    } catch (error) {
      console.error('Error saving projects', error);
      showDialog('error', 'Projects Save Failed', error instanceof Error ? error.message : 'Check the /api/projects POST/PUT backend and credentials.');
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
      <div className="max-w-5xl space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-10 transition-colors">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-purple-600" /> Project Configuration
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage project cards, links, and tech stacks for the public portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all">
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map((project, index) => (
          <div key={project.id || index} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm relative">
            <button onClick={() => handleRemove(index)} disabled={deletingIndex === index} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
              {deletingIndex === index ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-12">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Project Title</label>
                <input type="text" value={project.title} onChange={(e) => handleChange(index, 'title', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tech Stack</label>
                <input type="text" value={project.techStack} onChange={(e) => handleChange(index, 'techStack', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="React, Spring Boot, PostgreSQL" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                <textarea rows={4} value={project.description} onChange={(e) => handleChange(index, 'description', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-y" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub URL</label>
                <input type="text" value={project.githubUrl || ''} onChange={(e) => handleChange(index, 'githubUrl', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Link2 className="w-4 h-4" /> Live URL</label>
                <input type="text" value={project.link || ''} onChange={(e) => handleChange(index, 'link', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Image URL</label>
                <input type="text" value={project.imageUrl || ''} onChange={(e) => handleChange(index, 'imageUrl', e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button onClick={() => handleSave(index)} disabled={savingIndex === index} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50">
                  {savingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingIndex === index ? 'Saving...' : project.id ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
            <FolderGit2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No projects added yet.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
