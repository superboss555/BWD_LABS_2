import { Sequelize } from 'sequelize';
import 'dotenv/config';

const db_name = process.env.DB_NAME || 'postgres';
const db_user = process.env.DB_USER || 'postgres';
const db_password = process.env.DB_PASSWORD || 'postgres';
const db_host = process.env.DB_HOST || 'localhost';
const db_port = process.env.DB_PORT || '5432';

export const sequelize = new Sequelize(db_name, db_user, db_password, {
  host: db_host,
  port: parseInt(db_port),
  dialect: 'postgres',
  logging: false,
});

export const authDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.debug('Соединение с БД установлено!');
  } catch (error) {
    console.debug(`Соединение с БД не установлено. Ошибка: ${error}`);
    throw error;
  }
};

export const syncDB = async (shouldForce = false): Promise<void> => {
  try {
    await import('../models/index.js');

    await sequelize.sync({ force: shouldForce });
    console.debug(
      `Таблицы синхронизированы! ${shouldForce ? '(с пересозданием)' : ''}`,
    );
  } catch (error) {
    console.debug(`Таблицы не синхронизированы. Ошибка: ${error}`);
    throw error;
  }
};

export const seedDB = async (): Promise<{
  users: any[];
  events: any[];
} | void> => {
  try {
    console.debug('Начинаем заполнение базы данных...');

    const { User, Event } = await import('../models/index.js');

    const userCount = await User.count();
    const eventCount = await Event.count();

    console.debug(
      `Текущее количество записей: пользователей - ${userCount}, мероприятий - ${eventCount}`,
    );

    if (userCount > 0 || eventCount > 0) {
      console.debug('База данных уже содержит данные, заполнение пропущено');
      return;
    }

    console.debug('Создаем пользователей...');

    const userList = [
      {
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        password: 'password123',
      },
      {
        name: 'Мария Петрова',
        email: 'maria@example.com',
        password: 'password123',
      },
      {
        name: 'Алексей Сидоров',
        email: 'alex@example.com',
        password: 'password123',
      },
      {
        name: 'Екатерина Смирнова',
        email: 'kate@example.com',
        password: 'password123',
      },
      {
        name: 'Дмитрий Козлов',
        email: 'dmitry@example.com',
        password: 'password123',
      },
    ];

    const users: any[] = [];
    for (const userData of userList) {
      const user = await User.create(userData);
      users.push(user);
    }

    console.debug(`Создано ${users.length} пользователей`);

    const now = new Date();

    console.debug('Создаем мероприятия...');
    const events = await Event.bulkCreate([
      {
        title: 'Конференция по веб-разработке',
        description: 'Ежегодная конференция по современным веб-технологиям',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdBy: users[0].id,
      },
      {
        title: 'Мастер-класс по JavaScript',
        description: 'Практический мастер-класс по продвинутому JavaScript',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdBy: users[1].id,
      },
      {
        title: 'Хакатон по разработке мобильных приложений',
        description:
          'Трехдневный хакатон для разработчиков мобильных приложений',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        createdBy: users[2].id,
      },
      {
        title: 'Вебинар: Основы React',
        description: 'Вводный вебинар по библиотеке React',
        date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        createdBy: users[0].id,
      },
      {
        title: 'Встреча группы разработчиков Node.js',
        description: 'Ежемесячная встреча сообщества Node.js разработчиков',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdBy: users[3].id,
      },
      {
        title: 'Семинар по базам данных',
        description: 'Углубленный семинар по оптимизации баз данных',
        date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        createdBy: users[2].id,
      },
      {
        title: 'Мастер-класс по Docker',
        description: 'Практическое введение в Docker и контейнеризацию',
        date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        createdBy: users[4].id,
      },
      {
        title: 'Лекция по кибербезопасности',
        description: 'Современные угрозы и методы защиты веб-приложений',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        createdBy: users[1].id,
      },
      {
        title: 'Воркшоп по дизайну интерфейсов',
        description:
          'Практические приемы создания удобных пользовательских интерфейсов',
        date: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        createdBy: users[3].id,
      },
      {
        title: 'Конференция по искусственному интеллекту',
        description: 'Последние достижения в области ИИ и машинного обучения',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        createdBy: users[4].id,
      },
      {
        title: 'Митап по TypeScript',
        description:
          'Обмен опытом и лучшими практиками при работе с TypeScript',
        date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
        createdBy: users[2].id,
      },
      {
        title: 'Курс по GraphQL',
        description: 'Введение в GraphQL и его использование с React и Node.js',
        date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        createdBy: users[0].id,
      },
    ]);

    console.debug(`Создано ${events.length} мероприятий`);
    console.debug('База данных успешно заполнена тестовыми данными');

    return { users, events };
  } catch (error) {
    console.error(`Ошибка при заполнении базы данных: ${error}`);
    throw error;
  }
};

export const resetAndSeedDB = async (): Promise<void> => {
  try {
    await syncDB(true);
    await seedDB();
  } catch (error) {
    console.error(`Ошибка при сбросе и заполнении базы данных: ${error}`);
    throw error;
  }
};
