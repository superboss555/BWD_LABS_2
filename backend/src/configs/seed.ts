// Скрипт для заполнения базы данных тестовыми данными
import { authDB, resetAndSeedDB } from './db.js';

(async (): Promise<void> => {
  try {
    console.log('Устанавливаем соединение с базой данных...');
    await authDB();

    console.log('Начинаем сброс и заполнение базы данных...');
    await resetAndSeedDB();

    console.log('База данных успешно заполнена!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
})();
