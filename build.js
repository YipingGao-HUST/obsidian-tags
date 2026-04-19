const esbuild = require('esbuild');
const path = require('path');

async function build() {
  try {
    await esbuild.build({
      entryPoints: [path.join(__dirname, 'src', 'main.ts')],
      bundle: true,
      platform: 'browser',
      target: 'es2020',
      outfile: path.join(__dirname, 'dist', 'main.js'),
      format: 'cjs',
      sourcemap: false,
      minify: false,
      external: ['obsidian'],
    });
    console.log('Plugin built successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();