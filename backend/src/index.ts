import express, { json, Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import cors, { CorsOptions } from 'cors';
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
import { logTokenForParticipants } from './middlewares/logTokenForParticipants.js';

// Middleware для логирования заголовка Authorization
const logAuthHeader = (req: Request, res: Response, next: NextFunction) => {
console.log('Authorization header:', req.headers.authorization);
next();
};

const app = express();
const port = process.env.APP_PORT || 3000;

app.use(morgan('[:method] :url'));

app.use(json());

// Логирование всех запросов
app.use((req: Request & { user?: any }, res: Response, next: NextFunction) => {
console.log(`\n=== Incoming request ===`);
console.log(`Method: ${req.method}`);
console.log(`URL: ${req.originalUrl}`);
console.log('Headers:', req.headers);
console.log('Body:', req.body);
if (req.user) {
console.log('User:', req.user);
}
next();
});

// Логирование ответов
app.use((req, res, next) => {
const originalSend = res.send;
res.send = function (body) {
console.log(`Response status: ${res.statusCode}, body:`, body);
return originalSend.call(this, body);
};
next();
});

// Глобальный обработчик ошибок
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
console.error('Unhandled error:', err);
res.status(500).json({ status: 'error', message: 'Внутренняя ошибка сервера' });
});

const corsOptions: CorsOptions = {
origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
if (!origin || allowedOrigins.includes(origin)) {
callback(null, true);
} else {
callback(new Error('Not allowed by CORS'));
}
},
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
credentials: true,
optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(passport.initialize());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/', publicRouter);

app.use('/auth', authRouter);

// Защищённые маршруты с логированием заголовка Authorization
app.use(
'/events',
apiKeyAuth as express.RequestHandler,
logTokenForParticipants,
logAuthHeader,
(_req, _res, next) => {
console.log('Before isAuthenticated');
next();
},
isAuthenticated as express.RequestHandler,
(_req, _res, next) => {
console.log('After isAuthenticated');
next();
},
eventRouter, // подключаем eventRouter сюда
);

app.use(
'/users',
apiKeyAuth as express.RequestHandler,
logAuthHeader,
isAuthenticated as express.RequestHandler,
userRouter,
);

app.use('/', baseRouter);

const RESET_DATABASE = process.env.RESET_DATABASE === 'true';

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