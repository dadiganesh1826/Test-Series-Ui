import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true, // Opens browser automatically
    },
    build: {
        outDir: 'build', // Matches CRA's output directory
    },
});
