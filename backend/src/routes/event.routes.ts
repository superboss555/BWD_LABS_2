import { Router } from 'express';
import passport from '../configs/passport.js';
import EventController from '../controllers/EventController.ts';
import eventParticipantRoutes from './EventParticipant.routes.ts'; // импорт маршрутов участников
import { Request, Response, NextFunction } from 'express';

const eventRouter = Router();

const logRequestInfo = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  console.log(`\n--- ${req.method} ${req.originalUrl} ---`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  next();
};

/**
 * @swagger
 * /events/user:
 *   get:
 *     summary: Получить мероприятия пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список мероприятий пользователя
 *       401:
 *         description: Необходима авторизация
 */
eventRouter.get(
  '/user',

  EventController.getUserEvents,
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Получить мероприятие по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID мероприятия
 *     responses:
 *       200:
 *         description: Мероприятие найдено
 *       404:
 *         description: Мероприятие не найдено
 */
eventRouter.get('/:id', EventController.getOne);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Создать новое мероприятие
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Мероприятие создано
 *       400:
 *         description: Неверные данные
 *       401:
 *         description: Необходима авторизация
 */
eventRouter.post(
  '/',

  EventController.create,
);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Обновить мероприятие
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Мероприятие обновлено
 *       401:
 *         description: Необходима авторизация
 *       404:
 *         description: Мероприятие не найдено
 */
eventRouter.put(
  '/:id',
  logRequestInfo,
  EventController.update,
);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Удалить мероприятие
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Мероприятие удалено
 *       401:
 *         description: Необходима авторизация
 *       404:
 *         description: Мероприятие не найдено
 */
eventRouter.delete('/:id', EventController.delete);

// Подключаем маршруты участников
eventRouter.use('/', eventParticipantRoutes);

export default eventRouter;
