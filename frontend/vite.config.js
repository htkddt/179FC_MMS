import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export const FRONTEND_ENVIRONMENTS = Object.freeze({
  localHost: 'LocalHost',
  production: 'Production',
});

export function normalizeBasePath(basePath) {
  if (!basePath || basePath === '/') {
    return '/';
  }

  return `/${basePath.replace(/^\/+|\/+$/g, '')}/`;
}

export function resolveFrontendEnvironment(mode) {
  return mode === 'production'
    ? FRONTEND_ENVIRONMENTS.production
    : FRONTEND_ENVIRONMENTS.localHost;
}

export function resolveAppBasePath(mode, basePath) {
  return resolveFrontendEnvironment(mode) === FRONTEND_ENVIRONMENTS.production
    ? normalizeBasePath(basePath)
    : '/';
}

export default defineConfig(({ mode }) => {
  const environment = resolveFrontendEnvironment(mode);
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: resolveAppBasePath(mode, env.VITE_BASE_PATH),
    plugins: [react()],
    define: {
      __FRONTEND_ENVIRONMENT__: JSON.stringify(environment),
    },
  };
});
