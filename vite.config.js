import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@/Layouts': path.resolve(__dirname, './resources/js/Layouts')
        },
    },
    optimizeDeps: {
        include: ['@inertiajs/react', 'react', 'react-dom'],
    },
});
