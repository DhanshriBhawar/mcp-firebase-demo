const vapidKey = 'BE8l4NxNWjd7O_PmuS8y8imsF3cDpkKGCDGzJ-KUmhZjvahfXlP4qiSOF-xFsfpDFndduhEYqciZfD18_QTCxT8';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
