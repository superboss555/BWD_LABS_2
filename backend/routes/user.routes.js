import { Router } from 'express'
import UserController from '../controllers/UserController.js'

const userRouter = Router()

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список пользователей
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
userRouter.get('/', UserController.getAll)

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Пользователь создан
 *       400:
 *         description: Неверные данные или пользователь уже существует
 */
userRouter.post('/', UserController.create)

export default userRouter 