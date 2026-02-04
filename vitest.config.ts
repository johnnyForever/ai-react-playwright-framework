import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate required environment variables
  const requiredVars = ['VITE_USER_EMAIL', 'VITE_USER_PASSWORD', 'VITE_ADMIN_EMAIL', 'VITE_ADMIN_PASSWORD'];
  const missingVars = requiredVars.filter(v => !env[v]);
  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing required environment variables for tests: ${missingVars.join(', ')}`);
    console.warn('Please set these in your .env file');
  }
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Expose VITE_* variables to tests via import.meta.env
      // Values must be set in .env file - no hardcoded fallbacks
      'import.meta.env.VITE_USER_EMAIL': JSON.stringify(env.VITE_USER_EMAIL || ''),
      'import.meta.env.VITE_USER_PASSWORD': JSON.stringify(env.VITE_USER_PASSWORD || ''),
      'import.meta.env.VITE_ADMIN_EMAIL': JSON.stringify(env.VITE_ADMIN_EMAIL || ''),
      'import.meta.env.VITE_ADMIN_PASSWORD': JSON.stringify(env.VITE_ADMIN_PASSWORD || ''),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/test/'],
      },
    },
  };
});
