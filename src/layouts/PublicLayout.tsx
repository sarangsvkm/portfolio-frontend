import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function PublicLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const logoName = localStorage.getItem('site.logoName') || 'Portfolio';
  const logoImageUrl = localStorage.getItem('site.logoImageUrl') || '';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'About', href: '/#about' },
    { name: 'Skills', href: '/#skills' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Education', href: '/#education' },
    { name: 'Projects', href: '/#projects' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      {/* Premium Floating Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center ${
          isScrolled ? 'pt-4 px-4' : 'pt-0 px-0'
        }`}
      >
        <motion.div 
          layout
          className={`w-full transition-all duration-500 flex justify-center ${
            isScrolled 
              ? 'max-w-xl glass rounded-full px-6 py-3 shadow-2xl premium-blur border-white/20' 
              : 'max-w-full bg-transparent px-8 md:px-16 py-8'
          }`}
        >
          <div className="w-full flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              {logoImageUrl && (
                <div className="relative">
                   <div className="absolute inset-0 bg-purple-500/20 blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <img 
                    src={resolveAssetUrl(logoImageUrl)} 
                    alt={logoName} 
                    className="h-8 w-auto object-contain transition-all group-hover:scale-110 relative" 
                  />
                </div>
              )}
              {!isScrolled && (
                <h1 className="text-2xl font-black tracking-tighter text-gradient hidden sm:block">
                  {logoName}
                </h1>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6 lg:gap-10 items-center text-xs lg:text-sm font-bold uppercase tracking-widest">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="relative text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all group-hover:w-full group-hover:left-0" />
                </a>
              ))}
              
              {/* CTA based on scroll state */}
              <Link 
                to="/resume" 
                className={`transition-all duration-300 font-bold rounded-full flex items-center gap-2 ${
                  isScrolled 
                    ? 'p-2 bg-indigo-600 text-white shadow-lg hover:bg-indigo-700' 
                    : 'px-6 py-2.5 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105'
                }`}
              >
                {isScrolled ? <ExternalLink size={16} /> : 'Resume'}
              </Link>
            </nav>

            {/* Mobile Toggle (Inside Pill) */}
            <button 
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[60] glass premium-blur md:hidden flex flex-col items-center justify-center gap-8 text-4xl font-black uppercase tracking-tighter"
            >
               <button 
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-10 right-10 p-4 rounded-full glass"
              >
                <X size={32} />
              </button>

              {navLinks.map((link, i) => (
                <motion.a
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-900 dark:text-white hover:text-indigo-600 transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  to="/resume"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-full text-2xl font-bold"
                >
                  View Resume
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Premium Hub-style Footer */}
      <footer className="py-20 border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
        
        <div className="container mx-auto px-6 md:px-16">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
               <Link to="/" className="text-3xl font-black tracking-tighter text-gradient">
                {logoName}
              </Link>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-lg font-medium leading-relaxed">
                Empowering the future through design, code, and innovative digital experiences.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Navigation</h4>
              <nav className="flex flex-col gap-3 font-semibold">
                {navLinks.map(link => (
                  <a key={link.name} href={link.href} className="hover:text-indigo-500 transition-colors">{link.name}</a>
                ))}
                <Link to="/resume" className="hover:text-indigo-500 transition-colors">Resume</Link>
              </nav>
            </div>

            <div className="space-y-4">
               <h4 className="text-sm font-black uppercase tracking-widest text-gray-500">Socials</h4>
               <div className="flex gap-4">
                  <a href="#" className="p-3 rounded-2xl glass hover:border-indigo-500/50 hover:text-indigo-500 transition-all shadow-sm"><Github size={20}/></a>
                  <a href="#" className="p-3 rounded-2xl glass hover:border-blue-500/50 hover:text-blue-500 transition-all shadow-sm"><Linkedin size={20}/></a>
                  <a href="#" className="p-3 rounded-2xl glass hover:border-red-500/50 hover:text-red-500 transition-all shadow-sm"><Mail size={20}/></a>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-100 dark:border-white/5 gap-6">
            <p className="text-gray-400 dark:text-gray-600 text-sm font-medium">
              &copy; {new Date().getFullYear()} <span className="font-bold text-gray-900 dark:text-gray-300">{logoName}</span>. Crafted for Excellence.
            </p>
            <div className="flex gap-8 text-xs font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-700">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
        
        {/* Subtle Decorative Aura */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      </footer>
    </div>
  );
}
