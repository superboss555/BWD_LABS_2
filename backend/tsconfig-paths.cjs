const tsConfigPaths = require('tsconfig-paths');

// Регистрация алиасов для NodeJS без чтения из tsconfig.json
tsConfigPaths.register({
  baseUrl: './src',
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
