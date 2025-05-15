import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/AuthController.js';
import passport from '../configs/passport.js';

const authRouter = Router();

// Middleware для логирования запросов на refresh токен
const logRefreshRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('Получен запрос на обновление токена:', {
    headers: req.headers,
    body: req.body,
  });
  next();
};

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - name
 *               - password
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
authRouter.post('/register', AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Аутентификация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Успешная аутентификация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Неверные учетные данные
 */
authRouter.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Обновление access токена с использованием refresh токена
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Токены успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Недействительный или просроченный refresh токен
 */
authRouter.post('/refresh', logRefreshRequest, AuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя из системы (удаление refresh токена)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Успешный выход из системы
 *       400:
 *         description: Refresh токен не предоставлен
 */
authRouter.post('/logout', AuthController.logout);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Получение профиля авторизованного пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *       401:
 *         description: Необходима авторизация
 */
authRouter.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  AuthController.getProfile,
);

/**
 * @swagger
 * /auth/test:
 *   get:
 *     summary: Тестовый эндпоинт для проверки JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: JWT валиден
 *       401:
 *         description: Необходима авторизация или недействительный JWT
 */
authRouter.get(
  '/test',
  passport.authenticate('jwt', { session: false }),
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      message: 'JWT валиден',
      data: {
        user: req.user,
      },
    });
  },
);

export default authRouter;
