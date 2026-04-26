import { motion } from 'framer-motion';
import { Sparkles, Brain, Cpu, Zap } from 'lucide-react';

export default function AIFooter() {
  return (
    <footer className="relative py-20 overflow-hidden border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-center space-y-12">
          
          {/* AI Core Animation */}
          <div className="relative group cursor-help">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-150 animate-pulse" />
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="relative h-24 w-24 rounded-full glass border-indigo-500/30 flex items-center justify-center shadow-2xl"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border border-indigo-500/10 animate-ping" />
              </div>
              <Brain size={40} className="text-indigo-600 dark:text-indigo-400" />
            </motion.div>
          </div>

          <div className="text-center space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Cpu size={14} /> Neural Interface Active
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter">
              Crafted by <span className="text-gradient">Antigravity AI</span>
            </h3>
            
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              This portfolio was architected and optimized by Antigravity, a high-performance agentic AI coding assistant. 
              Bridging the gap between human creativity and synthetic precision.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 pt-6">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Zap size={14} className="text-yellow-500" /> Real-time Optimization
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Sparkles size={14} className="text-purple-500" /> Generative Architecture
             </div>
          </div>

          <div className="pt-12 border-t border-gray-100 dark:border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} All Rights Reserved</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-indigo-600 transition-colors cursor-pointer">Security Protocol</span>
              <span className="hover:text-indigo-600 transition-colors cursor-pointer">Neural Assets</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Ambience */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </footer>
  );
}
