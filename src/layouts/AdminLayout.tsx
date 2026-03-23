import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Briefcase, GraduationCap, FolderGit2, LogOut, ExternalLink } from 'lucide-react';
import { authService } from '../services/authService';

export default function AdminLayout() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Profile', path: '/admin/profile', icon: User },
    { name: 'Experience', path: '/admin/experience', icon: Briefcase },
    { name: 'Education', path: '/admin/education', icon: GraduationCap },
    { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  ];

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const handlePreview = () => {
    window.open('/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex text-gray-900 dark:text-gray-100 font-sans">
      <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 flex flex-col shadow-sm z-10 transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 h-20 flex items-center">
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">CMS Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:text-red-400 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center px-8 justify-between shrink-0 shadow-sm transition-colors duration-300">
           <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Admin Dashboard</h1>
           <div className="flex items-center gap-4">
             <button
               type="button"
               onClick={handlePreview}
               className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
             >
               <ExternalLink className="w-4 h-4" />
               Live Preview
             </button>
           </div>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50 dark:bg-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
