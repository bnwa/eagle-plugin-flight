// Simple development server for testing the plugin in a browser
// Using Node.js built-in http module

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const DIST_DIR = join(__dirname, 'dist');

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = createServer(async (req, res) => {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    const urlParts = filePath.split('?');
    filePath = urlParts[0];
    
    const fullPath = join(DIST_DIR, filePath);
    
    // Check if file exists
    try {
      const stats = await stat(fullPath);
      
      if (stats.isFile()) {
        const content = await readFile(fullPath);
        const mimeType = getMimeType(fullPath);
        
        res.writeHead(200, {
          'Content-Type': mimeType,
          'Content-Length': content.length,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
    } catch (fileError) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal server error');
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Development server running at http://localhost:${PORT}`);
  console.log('📁 Serving files from ./dist directory');
  console.log('🔄 Run "npm run dev" in another terminal to watch for changes');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
