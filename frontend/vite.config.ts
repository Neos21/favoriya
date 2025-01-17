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
    cacheDir: 'node_modules/.vite',  // キャッシュのディレクトリを指定する
    optimizeDeps: {
      entries: ['src/main.tsx']  // エントリーポイントを最適化する
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:6216',
          changeOrigin: true
        }
      }
    },
    define: envWithProcessPrefix,
    build: {
      sourcemap: false,
      esbuild: {
        jsxInject: 'import React from "react";'  // JSX のコンパイルを高速化する
      },
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom', 'react-error-boundary', '@reduxjs/toolkit', 'react-redux'],
            mui  : ['@emotion/react', '@emotion/styled', '@mui/icons-material', '@mui/material']
          }
        }
      }
    }
  };
});
