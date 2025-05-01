// Скрипт для заполнения базы данных тестовыми данными
import { authDB, resetAndSeedDB } from './db.js';

(async () => {
  try {
    console.log('Устанавливаем соединение с базой данных...');
    await authDB();
    
    console.log('Начинаем сброс и заполнение базы данных...');
    const result = await resetAndSeedDB();
    
    if (result) {
      console.log(`Создано ${result.users.length} пользователей и ${result.events.length} мероприятий`);
    }
    
    console.log('База данных успешно заполнена!');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  }
})(); 