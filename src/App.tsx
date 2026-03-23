import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicHome from './pages/public/Home';
import AdminDashboard from './pages/admin/Dashboard';
import ProfileEditor from './pages/admin/ProfileEditor';
import ExperienceEditor from './pages/admin/ExperienceEditor';
import EducationEditor from './pages/admin/EducationEditor';
import SkillsEditor from './pages/admin/SkillsEditor';
import ProjectsEditor from './pages/admin/ProjectsEditor';
import Login from './pages/admin/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<PublicHome />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<ProfileEditor />} />
          <Route path="experience" element={<ExperienceEditor />} />
          <Route path="education" element={<EducationEditor />} />
          <Route path="projects" element={<ProjectsEditor />} />
          <Route path="skills" element={<SkillsEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
