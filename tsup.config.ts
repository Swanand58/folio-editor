import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@tiptap/core',
    '@tiptap/pm',
    '@tiptap/react',
  ],
  treeshake: true,
  splitting: false,
});
