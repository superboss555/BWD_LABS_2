/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       required:
 *         - title
 *         - createdBy
 *       properties:
 *         id:
 *           type: integer
 *           description: ID события
 *         title:
 *           type: string
 *           description: Название события
 *         description:
 *           type: string
 *           description: Описание события
 *         date:
 *           type: string
 *           format: date
 *           description: Дата события
 *         createdBy:
 *           type: integer
 *           description: ID создателя события
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         email:
 *           type: string
 *           description: Email пользователя
 */

// Этот файл не экспортирует ничего, он просто предоставляет схемы для Swagger 