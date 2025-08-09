import { build } from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

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
        // Use mock implementation
        console.log('🎭 Using mock web frontend...');
        copyFileSync('mocks/main.js', 'dist/js/main.js');
        console.log('✅ Mock build complete!');
    } else {
        // Build TypeScript web frontend
        console.log('🔨 Building web frontend...');
        
        const buildOptions = {
            entryPoints: ['packages/web/src/index.ts'],
            bundle: true,
            outfile: 'dist/js/main.js',
            format: 'iife',
            target: 'es2020',
            minify: !isWatch,
            sourcemap: isWatch,
            platform: 'browser',
            define: {
                'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
            },
            banner: {
                js: '// Flight Web Frontend - Built with esbuild'
            }
        };

        if (isWatch) {
            console.log('👀 Starting watch mode...');
            const context = await build({
                ...buildOptions,
                plugins: [
                    {
                        name: 'rebuild-notify',
                        setup(build) {
                            build.onEnd((result) => {
                                if (result.errors.length === 0) {
                                    console.log('✅ Rebuild complete');
                                } else {
                                    console.log('❌ Build failed:', result.errors);
                                }
                            });
                        }
                    }
                ]
            });

            await context.watch();
            console.log('🎯 Watching for changes...');
        } else {
            await build(buildOptions);
            console.log('✅ Build complete!');
        }
    }
}

// Handle errors
buildProject().catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
});
