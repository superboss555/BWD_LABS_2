// Скрипт для пересоздания базы данных
import { authDB, syncDB, seedDB } from './db.js';

const resetDb = async (): Promise<void> => {
  try {
    console.log('Начинаем пересоздание базы данных...');

    await authDB();

    await syncDB(true);

    await seedDB();

    console.log('База данных успешно пересоздана!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при пересоздании базы данных:', error);
    process.exit(1);
  }
};

resetDb();
