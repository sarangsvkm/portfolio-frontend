import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

const PublicHome = lazy(() => import('./pages/public/Home'));
const ResumePage = lazy(() => import('./pages/public/Resume'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProfileEditor = lazy(() => import('./pages/admin/ProfileEditor'));
const ExperienceEditor = lazy(() => import('./pages/admin/ExperienceEditor'));
const EducationEditor = lazy(() => import('./pages/admin/EducationEditor'));
const SkillsEditor = lazy(() => import('./pages/admin/SkillsEditor'));
const ProjectsEditor = lazy(() => import('./pages/admin/ProjectsEditor'));
const ImageSettings = lazy(() => import('./pages/admin/ImageSettings'));
const ResumeBuilder = lazy(() => import('./pages/admin/ResumeBuilder'));
const Login = lazy(() => import('./pages/admin/Login'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<PublicHome />} />
            <Route path="resume" element={<ResumePage />} />
          </Route>

          <Route path="/srg-gate" element={<Login />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="experience" element={<ExperienceEditor />} />
            <Route path="education" element={<EducationEditor />} />
            <Route path="projects" element={<ProjectsEditor />} />
            <Route path="skills" element={<SkillsEditor />} />
            <Route path="images" element={<ImageSettings />} />
            <Route path="builder" element={<ResumeBuilder />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
