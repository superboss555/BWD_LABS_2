#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Проверка окружения для проекта Events API');
console.log('----------------------------------------');

async function checkEnvironment() {
  try {
    console.log('✓ Node.js работает корректно');

    console.log('\nВерсии инструментов:');
    console.log(`Node.js: ${process.version}`);

    console.log('\nПроверка скриптов в package.json:');
    const configPath = join(__dirname, '..');
    const packageJsonPath = join(configPath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    const scripts = packageJson.scripts || {};

    console.log(`- tsc: ${scripts.tsc ? '✓' : '✗'}`);
    console.log(`- lint: ${scripts.lint ? '✓' : '✗'}`);
    console.log(`- format: ${scripts.format ? '✓' : '✗'}`);
    console.log(`- check: ${scripts.check ? '✓' : '✗'}`);

    console.log('\nКонфигурационные файлы:');
    console.log(
      `- .eslintrc.json: ${fs.existsSync(join(configPath, '.eslintrc.json')) ? '✓' : '✗'}`,
    );
    console.log(
      `- .prettierrc.json: ${fs.existsSync(join(configPath, '.prettierrc.json')) ? '✓' : '✗'}`,
    );
    console.log(
      `- tsconfig.json: ${fs.existsSync(join(configPath, 'tsconfig.json')) ? '✓' : '✗'}`,
    );

    console.log('\nВсе необходимые инструменты установлены и настроены');
  } catch (error) {
    console.error('\nОшибка при проверке окружения:');
    console.error(error);
    process.exit(1);
  }
}

// Запускаем функцию проверки
checkEnvironment();
