import express, { json } from 'express';
import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import { authDB, syncDB, seedDB, resetAndSeedDB } from './configs/db.js';
import {
  eventRouter,
  userRouter,
  baseRouter,
  authRouter,
  publicRouter,
} from './routes/routes.js';
import { specs, swaggerUi } from './configs/swagger.js';
import apiKeyAuth from './middlewares/apiKeyAuth.js';
import passport from './configs/passport.js';
import { isAuthenticated } from './middlewares/authMiddleware.js';

const app = express();
const port = process.env.APP_PORT || 3000;

// Логирование запросов
app.use(morgan('[:method] :url'));

// Парсинг JSON-запросов
app.use(json());
app.use(cors());

// Инициализация Passport.js
app.use(passport.initialize());

// Документация Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Публичные маршруты
app.use('/', publicRouter);

// Маршруты аутентификации
app.use('/auth', authRouter);

// Защищенные маршруты
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

// Флаг для сброса базы данных
const RESET_DATABASE = process.env.RESET_DATABASE === 'true' || false;

async function startServer(): Promise<void> {
  try {
    await authDB();

    if (RESET_DATABASE) {
      console.debug(
        'Запрошен сброс базы данных - пересоздаем таблицы и заполняем тестовыми данными',
      );
      await resetAndSeedDB();
    } else {
      await syncDB();
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
