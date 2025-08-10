// Eagle plugin base functionality with HTTP server
// This file contains the basic Eagle plugin integration and serves the web frontend

console.log('Eagle plugin loaded');

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_PORT = 8080;
const MAX_PORT_ATTEMPTS = 10;
const CLIENT_DIR = path.join(__dirname, '..', 'client');

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
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

// HTTP Server for serving web frontend
class WebServer {
  constructor() {
    this.server = null;
    this.port = DEFAULT_PORT;
  }

  async findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = http.createServer();

      server.listen(startPort, 'localhost', () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          if (startPort - DEFAULT_PORT < MAX_PORT_ATTEMPTS) {
            resolve(this.findAvailablePort(startPort + 1));
          } else {
            reject(new Error(`No available port found after ${MAX_PORT_ATTEMPTS} attempts`));
          }
        } else {
          reject(err);
        }
      });
    });
  }

  async start() {
    try {
      this.port = await this.findAvailablePort(DEFAULT_PORT);

      this.server = http.createServer((req, res) => {
        let filePath = req.url === '/' ? '/index.html' : req.url;

        // Remove query parameters
        const urlParts = filePath.split('?');
        filePath = urlParts[0];

        const fullPath = path.join(CLIENT_DIR, filePath);

        // Security check - ensure file is within CLIENT_DIR
        const resolvedPath = path.resolve(fullPath);
        const resolvedClientDir = path.resolve(CLIENT_DIR);

        if (!resolvedPath.startsWith(resolvedClientDir)) {
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('Forbidden');
          return;
        }

        // Check if file exists and serve it
        fs.stat(fullPath, (err, stats) => {
          if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
          }

          fs.readFile(fullPath, (readErr, content) => {
            if (readErr) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Internal server error');
              return;
            }

            const mimeType = getMimeType(fullPath);
            res.writeHead(200, {
              'Content-Type': mimeType,
              'Content-Length': content.length,
              'Access-Control-Allow-Origin': '*'
            });
            res.end(content);
          });
        });
      });

      this.server.listen(this.port, 'localhost', () => {
        const url = `http://localhost:${this.port}`;
        console.log(`🌐 Web frontend server started at ${url}`);
        console.log(`📁 Serving files from ${CLIENT_DIR}`);

        // Store URL for potential future use
        if (typeof window !== 'undefined') {
          window.flightWebUrl = url;
        }
      });

      this.server.on('error', (err) => {
        console.error('❌ Web server error:', err);
      });

    } catch (error) {
      console.error('❌ Failed to start web server:', error);
    }
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('🛑 Web frontend server stopped');
      });
      this.server = null;
    }
  }
}

// Initialize web server
const webServer = new WebServer();

// Basic Eagle plugin initialization
if (typeof eagle !== 'undefined') {
    console.log('Eagle API available');

    // Plugin initialization logic
    eagle.onPluginCreate(() => {
        console.log('Plugin created');
        webServer.start();
    });

    eagle.onPluginShow(() => {
        console.log('Plugin shown');
        if (!webServer.server) {
            webServer.start();
        }
    });

    eagle.onPluginHide(() => {
        console.log('Plugin hidden');
    });

    eagle.onPluginDestroy(() => {
        console.log('Plugin destroyed');
        webServer.stop();
    });
} else {
    console.log('Eagle API not available - running in development mode');
    // Start server immediately in development mode
    webServer.start();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { webServer };
}
