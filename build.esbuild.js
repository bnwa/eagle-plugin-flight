import { copyFileSync, mkdirSync, existsSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

const isWatch = process.argv.includes('--watch');
const isMock = process.argv.includes('--mock');

// Helper function to copy directory recursively
function copyDir(src, dest) {
    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

// Helper function to run a command and wait for it
function runCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { 
            cwd, 
            stdio: 'inherit',
            shell: true 
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
        
        child.on('error', reject);
    });
}

async function buildProject() {
    const mode = isMock ? 'mock' : 'production';
    console.log(`🚀 Building Flight monorepo in ${mode} mode...`);

    // Ensure dist directory exists
    if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
    }

    // Copy Eagle plugin structure to dist
    console.log('📦 Copying Eagle plugin files...');
    copyDir('packages/eagle', 'dist');

    if (isMock) {
        // Create mock client directory with simple files
        console.log('🎭 Creating mock web frontend...');
        
        const clientDir = 'dist/client';
        if (!existsSync(clientDir)) {
            mkdirSync(clientDir, { recursive: true });
        }
        
        // Create mock index.html
        const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Web Frontend (Mock)</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: #f0f0f0; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Flight Web Frontend (Mock Mode)</h1>
        <p>This is a mock implementation for testing the Eagle plugin independently.</p>
        <p>✅ Mock frontend loaded successfully</p>
        <p>🌐 Served via Eagle plugin HTTP server</p>
    </div>
    <script src="main.js"></script>
</body>
</html>`;
        
        // Create mock main.js
        const mockJs = `// Mock web frontend JavaScript
console.log('Mock web frontend loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Mock web frontend initialized');
    
    // Add some interactive content
    const container = document.querySelector('.container');
    if (container) {
        const statusDiv = document.createElement('div');
        statusDiv.style.cssText = 'margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 4px;';
        statusDiv.innerHTML = '<h3>Mock Status</h3><p>🟢 Mock server running</p><p>🟢 Mock frontend active</p>';
        container.appendChild(statusDiv);
    }
});`;

        // Write mock files
        writeFileSync(join(clientDir, 'index.html'), mockHtml);
        writeFileSync(join(clientDir, 'main.js'), mockJs);
        
        console.log('✅ Mock build complete!');
    } else {
        // Build web frontend first
        console.log('🔨 Building web frontend...');
        
        if (isWatch) {
            console.log('👀 Starting watch mode for web frontend...');
            // In watch mode, start web build in background
            const webBuildProcess = spawn('npm', ['run', 'dev'], { 
                cwd: 'packages/web',
                stdio: 'inherit'
            });
            
            // Give it a moment to build initially
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            // Build web frontend synchronously
            await runCommand('npm', ['run', 'build'], 'packages/web');
        }
        
        // Copy web frontend dist to client directory
        console.log('📋 Copying web frontend to client directory...');
        const clientDir = 'dist/client';
        const webDistDir = 'packages/web/dist';
        
        if (existsSync(webDistDir)) {
            copyDir(webDistDir, clientDir);
            console.log('✅ Build complete!');
        } else {
            console.error('❌ Web frontend dist directory not found');
            process.exit(1);
        }
        
        if (isWatch) {
            console.log('🎯 Watching for changes... (Web frontend watch running separately)');
            // Keep the process alive in watch mode
            process.stdin.resume();
        }
    }
}

// Handle errors
buildProject().catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
