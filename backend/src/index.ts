import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import { authDB, syncDB, seedDB, resetAndSeedDB } from '@configs/db.js';
import {
  eventRouter,
  userRouter,
  baseRouter,
  authRouter,
  publicRouter,
} from '@routes/routes.js';
import { specs, swaggerUi } from '@configs/swagger.js';
import apiKeyAuth from '@middlewares/apiKeyAuth.js';
import passport from '@configs/passport.js';
import { isAuthenticated } from '@middlewares/authMiddleware.js';

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(morgan('[:method] :url'));

app.use(json());
app.use(cors());

app.use(passport.initialize());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', publicRouter);

app.use('/auth', authRouter);

app.use(
  '/events',
  apiKeyAuth as express.RequestHandler,
  isAuthenticated as express.RequestHandler,
  eventRouter,
);
app.use(
  '/users',
  apiKeyAuth as express.RequestHandler,
  isAuthenticated as express.RequestHandler,
  userRouter,
);
app.use('/', baseRouter);

const RESET_DATABASE = process.env.RESET_DATABASE === 'true' ? true : false;

async function startServer(): Promise<void> {
  try {
    console.log('Запуск сервера...');
    console.log('Подключение к базе данных PostgreSQL...');
    console.log(
      `Используются параметры: ${process.env.DB_HOST}:${process.env.DB_PORT}, ${process.env.DB_NAME}`,
    );

    await authDB();
    console.log('База данных подключена успешно!');

    if (RESET_DATABASE) {
      console.debug(
        'Запрошен сброс базы данных - пересоздаем таблицы и заполняем тестовыми данными',
      );
      await resetAndSeedDB();
    } else {
      await syncDB(false);
      await seedDB();
    }

    app.listen(port, () =>
      console.debug(`Сервер запущен на порту http://localhost:${port}`),
    );
  } catch (error) {
    console.error(`Ошибка при старте сервера: ${error}`);
    process.exit(1);
  }
}

startServer();

