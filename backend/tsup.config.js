import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { defineConfig } from 'tsup';

// Получение __dirname в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
  esbuildOptions(options) {
    options.alias = {
      '@': resolve(__dirname, 'src'),
      '@models': resolve(__dirname, 'src/models'),
      '@controllers': resolve(__dirname, 'src/controllers'),
      '@services': resolve(__dirname, 'src/services'),
      '@routes': resolve(__dirname, 'src/routes'),
      '@middlewares': resolve(__dirname, 'src/middlewares'),
      '@configs': resolve(__dirname, 'src/configs'),
      '@types': resolve(__dirname, 'src/types')
    };
  },
  // Включаем обработку расширения .js в импортах
  esbuildPlugins: [{
    name: 'fix-js-imports',
    setup(build) {
      // Перехватываем и обрабатываем импорты с расширением .js
      build.onResolve({ filter: /\.js$/ }, args => {
        if (args.kind !== 'import-statement') return null;
        return { path: args.path.replace('.js', ''), external: false };
      });
    }
  }]
}); 