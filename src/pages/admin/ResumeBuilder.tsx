import { useEffect, useState } from 'react';
import { Download, FileText, Loader2, FileCode2, Image as ImageIcon } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { configService } from '../../services/configService';
import { authService } from '../../services/authService';
import { normalizeResume, createFallbackResume } from '../../utils/resume';
import { downloadLatex } from '../../utils/latexGenerator';
import { downloadAtsPdf } from '../../utils/pdfGenerator';
import type { ResumeViewModel } from '../../types';

export default function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeViewModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeProfileImageUrl, setResumeProfileImageUrl] = useState('');

  useEffect(() => {
    resumeService
      .getResume()
      .then((res) => setResume(normalizeResume(res)))
      .catch((err) => {
        console.error('Failed to load resume for builder', err);
        setResume(normalizeResume(createFallbackResume()));
      })
      .finally(() => setLoading(false));

    configService
      .getConfigs(authService.getCredentials())
      .then((configs) => {
        const resumeImgConfig = configs.find((c) => c.configKey === 'site.resumeProfileImageUrl');
        if (resumeImgConfig?.configValue) {
          setResumeProfileImageUrl(resumeImgConfig.configValue);
        } else {
          // Also check localStorage as a fallback
          setResumeProfileImageUrl(localStorage.getItem('site.resumeProfileImageUrl') || '');
        }
      })
      .catch(() => {
        setResumeProfileImageUrl(localStorage.getItem('site.resumeProfileImageUrl') || '');
      });
  }, []);

  if (loading || !resume) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Export Builder</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Export your portfolio data instantly to ATS-friendly PDF templates or raw LaTeX source code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ATS PDF SECTION */}
        <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ATS PDF Generator</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Generates a clean, serif-font PDF tailored for Applicant Tracking Systems. Mimics standard LaTeX styling.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => downloadAtsPdf(resume, true, resumeProfileImageUrl || undefined)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  With Resume Photo
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </button>

            <button
              onClick={() => downloadAtsPdf(resume, false)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-blue-50 dark:bg-gray-900 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  Without Photo
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </button>
          </div>
        </section>

        {/* LATEX SOURCE SECTION */}
        <section className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">LaTeX Source Export</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Generates a fully formatted <code>.tex</code> source code file. You can upload this directly to Overleaf for deeper compilation.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => downloadLatex(resume, true, resumeProfileImageUrl || undefined)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-purple-50 dark:bg-gray-900 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  Source With Resume Photo
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            </button>

            <button
              onClick={() => downloadLatex(resume, false)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-purple-50 dark:bg-gray-900 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-800 rounded-xl transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <FileCode2 className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  Source Without Photo
                </span>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
