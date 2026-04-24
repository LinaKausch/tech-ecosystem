import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: ('index.html'),
        about: ('remote.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    // port: 5173,
    proxy: {
      // Any request starting with /socket.io gets forwarded to your node server
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true, // This enables WebSockets (Socket.io)
      },
    },
  },
});