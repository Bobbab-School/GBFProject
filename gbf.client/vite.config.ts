import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { env } from 'process';
import tailwindcss from '@tailwindcss/vite'

//const isDev = process.env.NODE_ENV !== 'production';

// Target backend API
const backendTarget = process.env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}`
: process.env.ASPNETCORE_URLS
    ? process.env.ASPNETCORE_URLS.split(';')[0]
    : 'https://localhost:7242';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), tailwindcss()],
    build: {
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/api': {
                target: backendTarget,
                changeOrigin: true,
                secure: false,
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '5141', 10),
        https: {}
    }
})
