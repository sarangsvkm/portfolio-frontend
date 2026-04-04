import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const resolveProxyTarget = (apiBaseUrl) => {
  if (!apiBaseUrl) {
    return 'https://api.sarangsvkm.in';
  }

  try {
    const parsedUrl = new URL(apiBaseUrl);
    return parsedUrl.origin;
  } catch {
    return 'https://api.sarangsvkm.in';
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = resolveProxyTarget(env.VITE_API_BASE_URL);

  return {
    plugins: [
      tailwindcss(),
      react(),
    ],
    server: {
      headers: {
        'Cache-Control': 'no-store',
      },
      proxy: {
        '/portfolioApi': {
          target: proxyTarget,
          changeOrigin: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
  };
})
