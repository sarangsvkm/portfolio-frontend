import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Monitor, 
  Laptop, 
  Smartphone, 
  Maximize2, 
  RotateCcw,
  ExternalLink,
  Info,
  Layout
} from 'lucide-react';

type DeviceType = 'tv' | 'monitor' | 'laptop' | 'desktop' | 'tablet' | 'phone';

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  icon: any;
  framePadding: string;
  borderRadius: string;
  scaleLabel: string;
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  tv: {
    name: 'Samsung 4K TV',
    width: 3840,
    height: 2160,
    icon: Tv,
    framePadding: '24px 24px 40px 24px',
    borderRadius: '8px',
    scaleLabel: 'Scaled (4K Resolution)',
  },
  monitor: {
    name: 'Ultra-wide Monitor',
    width: 2560,
    height: 1080,
    icon: Layout,
    framePadding: '16px 16px 36px 16px',
    borderRadius: '12px',
    scaleLabel: 'Scaled (21:9)',
  },
  desktop: {
    name: 'Studio Display',
    width: 1920,
    height: 1080,
    icon: Monitor,
    framePadding: '20px 20px 60px 20px',
    borderRadius: '16px',
    scaleLabel: 'Standard 1080p',
  },
  laptop: {
    name: 'MacBook Pro 16"',
    width: 1536,
    height: 960,
    icon: Laptop,
    framePadding: '24px 24px 32px 24px',
    borderRadius: '20px',
    scaleLabel: 'Retina Display',
  },
  tablet: {
    name: 'iPad Pro 11"',
    width: 834,
    height: 1194,
    icon: Layout,
    framePadding: '20px',
    borderRadius: '32px',
    scaleLabel: 'Portrait Tablet',
  },
  phone: {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    icon: Smartphone,
    framePadding: '12px',
    borderRadius: '48px',
    scaleLabel: 'Mobile View',
  },
};

export default function DevicePreview() {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('laptop');
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth - 100,
          height: containerRef.current.clientHeight - 200,
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const device = DEVICES[activeDevice];
  
  // Calculate automatic alignment scale
  const scaleX = containerSize.width / device.width;
  const scaleY = containerSize.height / device.height;
  const autoScale = Math.min(scaleX, scaleY, 1) * zoom;

  const resetZoom = () => setZoom(1);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Maximize2 className="text-purple-600" />
            Responsive Device Preview
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Experience your portfolio across professional hardware mockups. High-fidelity scaling enabled.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          {(Object.entries(DEVICES) as [DeviceType, DeviceConfig][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveDevice(key)}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${
                activeDevice === key
                  ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-md ring-1 ring-black/5 dark:ring-white/5'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
              title={cfg.name}
            >
              <cfg.icon size={18} />
              <span className="hidden lg:inline">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative flex-1 bg-gray-50 dark:bg-black/40 rounded-[32px] border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center p-8 pattern-dots"
      >
        {/* Background Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDevice}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
            style={{
              width: device.width,
              height: device.height,
              transform: `scale(${autoScale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Device Frame */}
            <div 
              className="relative w-full h-full bg-black shadow-2xl overflow-hidden border-[1px] border-white/20"
              style={{
                borderRadius: device.borderRadius,
                padding: activeDevice === 'phone' ? '12px' : '0',
              }}
            >
              {/* Bezel / Shadow Overlay */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 z-20" />
              
              {/* Stand for Monitor/Laptop/TV */}
              {(activeDevice === 'monitor' || activeDevice === 'desktop') && (
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-16 bg-gray-800 rounded-t-3xl -z-10" />
              )}
              
              {/* Notch for Phone */}
              {activeDevice === 'phone' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-30 flex items-center justify-center gap-2">
                  <div className="w-10 h-1 bg-gray-900 rounded-full" />
                  <div className="w-2 h-2 bg-gray-900 rounded-full" />
                </div>
              )}

              {/* Iframe Content */}
              <iframe 
                src="/"
                className="w-full h-full bg-white transition-opacity duration-500"
                style={{ border: 'none' }}
                title="Portfolio Preview"
              />
            </div>

            {/* Display Label Badge */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 whitespace-nowrap bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold ring-1 ring-white/20 shadow-xl pointer-events-none">
              <device.icon size={12} className="text-purple-400" />
              {device.name} • {device.width}x{device.height} ({device.scaleLabel})
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-40">
           <div className="flex items-center gap-1 px-2 border-r border-white/10 mr-1">
             <button 
               onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
               className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             >
               -
             </button>
             <span className="text-[10px] font-black text-white w-8 text-center">
               {Math.round(autoScale * 100)}%
             </span>
             <button 
               onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
               className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             >
               +
             </button>
           </div>
           
           <button 
             onClick={resetZoom}
             className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             title="Reset Scale"
           >
             <RotateCcw size={16} />
           </button>
           
           <a 
             href="/" 
             target="_blank" 
             className="p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
             title="Open Live Site"
           >
             <ExternalLink size={16} />
           </a>
        </div>

        {/* Resolution Info */}
        <div className="absolute top-6 left-6 max-w-[240px] p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl pointer-events-none z-40">
          <div className="flex items-start gap-3">
             <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                <Info size={16} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Canvas Engine</p>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  Site root is injected via sandbox iframe with hardware accelerated scaling.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
