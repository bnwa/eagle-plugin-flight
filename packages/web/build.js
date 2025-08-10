import { build } from 'esbuild';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const isWatch = process.argv.includes('--watch');

async function buildWeb() {
    console.log('🔨 Building web frontend SPA...');

    // Ensure dist directory exists
    if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
    }

    // Copy HTML file to dist
    copyFileSync('app/index.html', 'dist/index.html');

    // Build TypeScript to main.js
    const buildOptions = {
        entryPoints: ['app/index.ts'],
        bundle: true,
        outfile: 'dist/main.js',
        format: 'iife',
        target: 'es2021',
        minify: !isWatch,
        sourcemap: isWatch,
        platform: 'browser',
        define: {
            'process.env.NODE_ENV': isWatch ? '"development"' : '"production"'
        },
        banner: {
            js: '// Flight Web Frontend SPA - Built with esbuild'
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
                                // Copy HTML on rebuild
                                copyFileSync('app/index.html', 'dist/index.html');
                                console.log('✅ Web frontend rebuild complete');
                            } else {
                                console.log('❌ Web frontend build failed:', result.errors);
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
        console.log('✅ Web frontend build complete!');
    }
}

buildWeb().catch((error) => {
    console.error('❌ Web frontend build failed:', error);
    process.exit(1);
});
