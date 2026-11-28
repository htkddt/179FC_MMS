import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export const FRONTEND_ENVIRONMENTS = Object.freeze({
  localHost: 'LocalHost',
  production: 'Production',
});

export function resolveFrontendEnvironment(mode) {
  return mode === 'production'
    ? FRONTEND_ENVIRONMENTS.production
    : FRONTEND_ENVIRONMENTS.localHost;
}

export default defineConfig(({ mode }) => {
  const environment = resolveFrontendEnvironment(mode);

  return {
    plugins: [react()],
    define: {
      __FRONTEND_ENVIRONMENT__: JSON.stringify(environment),
    },
  };
});
