import { useEffect, useState } from 'react';
import { Briefcase, FolderGit2, GraduationCap, Sparkles, UserRound } from 'lucide-react';
import { resumeService } from '../../services/resumeService';
import { contactService } from '../../services/contactService';
import { createFallbackResume, normalizeResume } from '../../utils/resume';
import type { ContactRequest, ResumeViewModel } from '../../types';

const cards = [
  { key: 'profile', label: 'Profile Ready', icon: UserRound },
  { key: 'projects', label: 'Projects', icon: FolderGit2 },
  { key: 'skills', label: 'Skills', icon: Sparkles },
  { key: 'experiences', label: 'Experience Entries', icon: Briefcase },
  { key: 'educations', label: 'Education Entries', icon: GraduationCap },
] as const;

export default function AdminDashboard() {
  const [resume, setResume] = useState<ResumeViewModel | null>(null);
  const [report, setReport] = useState<ContactRequest[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportExporting, setReportExporting] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    resumeService
      .getResume()
      .then((res) => setResume(normalizeResume(res)))
      .catch(() => setResume(createFallbackResume()));
  }, []);

  const loadContactReport = async () => {
    setReportError('');
    setReportLoading(true);
    try {
      const data = await contactService.getContactReport();
      setReport(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unknown error';
      setReportError(`Failed to load contact report: ${message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const printContactReport = async () => {
    if (!report.length) return;
    setReportError('');
    setReportExporting(true);

    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF({ unit: 'pt' });
      doc.setFontSize(14);
      doc.text('Contact Report', 40, 40);

      autoTable(doc, {
        head: [[
          'ID',
          'Name',
          'Email',
          'Phone',
          'Verified',
          'Date',
          'Message',
        ]],
        body: report.map((item) => {
          const reportDate = item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : item.date && item.time
            ? `${item.date} ${item.time}`
            : '-';

          return [
            item.id ?? '-',
            item.name,
            item.email,
            item.phone,
            item.verified ? 'Yes' : 'No',
            reportDate,
            item.message ?? '-',
          ];
        }),
        startY: 60,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [85, 63, 179] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        theme: 'striped',
      });
      doc.save('contact-report.pdf');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Unknown error';
      setReportError(`Failed to export contact report: ${message}`);
    } finally {
      setReportExporting(false);
    }
  };

  const downloadCsv = () => {
    if (!report.length) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Verified', 'Date', 'Message'];
    const rows = report.map((item) => {
      const reportDate = item.createdAt
        ? new Date(item.createdAt).toISOString()
        : item.date && item.time
        ? `${item.date} ${item.time}`
        : '-';

      return [
        item.id ?? '-',
        item.name,
        item.email,
        item.phone,
        item.verified ? 'Yes' : 'No',
        reportDate,
        item.message ?? '-',
      ];
    });
    const csvContent = [headers, ...rows]
      .map((e) =>
        e
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contact-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!resume) {
    return <div className="text-gray-500 dark:text-gray-400">Loading dashboard...</div>;
  }

  const stats = {
    profile: resume.profile.name ? 'Yes' : 'No',
    projects: String(resume.projects.length),
    skills: String(resume.skills.length),
    experiences: String(resume.experiences.length),
    educations: String(resume.educations.length),
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold mb-2">Welcome to CMS Admin</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The dashboard is now backed by the updated resume API collection. Use the sidebar to edit each section and publish the full resume payload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div key={card.key} className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</h3>
              <card.icon className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-3">{stats[card.key]}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Public Snapshot</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{resume.profile.about || 'No about text saved yet.'}</p>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Report</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Fetch the latest contact report and print a PDF table.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadContactReport}
              disabled={reportLoading}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {reportLoading ? 'Loading...' : 'Load Report'}
            </button>
            <button
              onClick={printContactReport}
              disabled={!report.length || reportExporting}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              {reportExporting ? 'Preparing PDF...' : 'Print Report PDF'}
            </button>
            <button
              onClick={downloadCsv}
              disabled={!report.length}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Download CSV Report
            </button>
          </div>
        </div>

        {reportError ? (
          <p className="mt-4 text-sm text-red-600">{reportError}</p>
        ) : null}

        {report.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Verified</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item) => (
                  <tr key={String(item.id) + item.email} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-2">{item.id ?? '-'}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.email}</td>
                    <td className="p-2">{item.phone}</td>
                    <td className="p-2">{item.verified ? 'Yes' : 'No'}</td>
                    <td className="p-2">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : item.date && item.time
                        ? `${item.date} ${item.time}`
                        : '-'}
                    </td>
                    <td className="p-2">{item.message ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-gray-500 dark:text-gray-400">No report data loaded yet.</p>
        )}
      </div>
    </div>
  );
}
