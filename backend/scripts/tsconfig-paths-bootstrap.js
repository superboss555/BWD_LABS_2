import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

register({
  baseUrl: resolve(__dirname, '../src'),
  paths: {
    '@/*': ['*'],
    '@models/*': ['models/*'],
    '@controllers/*': ['controllers/*'],
    '@services/*': ['services/*'],
    '@routes/*': ['routes/*'],
    '@middlewares/*': ['middlewares/*'],
    '@configs/*': ['configs/*'],
    '@types/*': ['types/*'],
  },
});
