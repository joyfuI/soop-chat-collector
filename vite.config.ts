import path from 'node:path';
import { fileURLToPath } from 'node:url';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import electron from 'vite-plugin-electron/simple';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      electron({ main: { entry: 'electron/main.ts' } }),
    ],
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${env.VITE_API_PORT}`,
          changeOrigin: true,
        },
      },
      watch: {
        ignored: (watchedPath) => {
          const absolutePath = path.isAbsolute(watchedPath)
            ? watchedPath
            : path.resolve(projectRoot, watchedPath);

          const relativePath = path.relative(
            path.join(projectRoot, 'soop-chat-collector'),
            absolutePath,
          );

          return (
            relativePath === '' ||
            (relativePath !== '..' &&
              !relativePath.startsWith(`..${path.sep}`) &&
              !path.isAbsolute(relativePath))
          );
        },
      },
    },
  };
});
