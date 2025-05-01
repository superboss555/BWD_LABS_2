import express, { json } from 'express'
import 'dotenv/config'
import cors from 'cors'
import morgan from 'morgan'
import { authDB, syncDB, seedDB, resetAndSeedDB } from './configs/db.js'
import { eventRouter, userRouter, baseRouter, authRouter, publicRouter } from './routes/routes.js'
import { specs, swaggerUi } from './configs/swagger.js'
import apiKeyAuth from './middlewares/apiKeyAuth.js'
import passport from './configs/passport.js'
import { isAuthenticated } from './middlewares/authMiddleware.js'

const app = express()
const port = process.env.APP_PORT

// Логирование
app.use(morgan('[:method] :url'))

// Настройка JSON и CORS
app.use(json())
app.use(cors())

// Инициализация Passport
app.use(passport.initialize())

// Документация API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Публичные маршруты (без аутентификации)
app.use('/', publicRouter)

// Маршруты для аутентификации (без проверки API-ключа)
app.use('/auth', authRouter)

// Проверка API-ключа для всех маршрутов, кроме базовых и документации
app.use('/events', apiKeyAuth, isAuthenticated, eventRouter)
app.use('/users', apiKeyAuth, isAuthenticated, userRouter)
app.use('/', baseRouter)

// Флаг для пересоздания и заполнения базы данных при запуске
// Установите в true, чтобы сбросить и заполнить базу
const RESET_DATABASE = process.env.RESET_DATABASE === 'true' || false

async function startServer() {
	try {
		await authDB()
		
		if (RESET_DATABASE) {
			console.debug('Запрошен сброс базы данных - пересоздаем таблицы и заполняем тестовыми данными')
			await resetAndSeedDB()
		} else {
			// Обычная синхронизация и проверка наличия данных
			await syncDB()
			await seedDB()
		}

		app.listen(port, () =>
			console.debug(`Сервер запущен на порту http://localhost:${port}`)
		)
	} catch (error) {
		console.error(`Ошибка при старте сервера: ${error}`)
		process.exit(1) // Завершение процесса с кодом ошибки
	}
}

startServer()
