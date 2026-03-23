import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      <header className="py-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Portfolio</h1>
          <nav className="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About</a>
            <a href="#skills" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Skills</a>
            <a href="#experience" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Experience</a>
            <a href="#education" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Education</a>
            <a href="#projects" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Projects</a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500 mt-20">
        <p>&copy; {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-75">Built with React, Tailwind & Spring Boot</p>
      </footer>
    </div>
  );
}
