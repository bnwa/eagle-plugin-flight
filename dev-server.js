// Simple development server for testing the plugin in a browser
import { serve } from 'bun';

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;
    
    // Serve from dist directory
    if (filePath === '/') {
      filePath = '/index.html';
    }
    
    try {
      const file = Bun.file(`./dist${filePath}`);
      return new Response(file);
    } catch (error) {
      return new Response('File not found', { status: 404 });
    }
  },
});

console.log(`🌐 Development server running at http://localhost:${server.port}`);
console.log('📁 Serving files from ./dist directory');
console.log('🔄 Run "bun run dev" in another terminal to watch for changes');
