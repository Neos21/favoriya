import { defineConfig, loadEnv } from 'vite';

import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(props => {
  // NOTE : `import.meta.env` で読み込むと Jest がエラーになるため、以下のやり方で `process.env` を展開できるようにする
  const env = loadEnv(props.mode, process.cwd(), 'VITE');
  const envWithProcessPrefix = {
    'process.env': `${JSON.stringify(env)}`
  };
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:6216',
          changeOrigin: true
        }
      }
    },
    define: envWithProcessPrefix
  };
});
