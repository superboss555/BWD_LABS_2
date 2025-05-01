import express, { json } from 'express'
import 'dotenv/config'
import cors from 'cors'
import morgan from 'morgan'
import { authDB, syncDB } from './configs/db.js'
import { eventRouter, userRouter, baseRouter } from './routes/routes.js'
import { specs, swaggerUi } from './configs/swagger.js'

const app = express()
const port = process.env.APP_PORT

// Логирование
app.use(morgan('[:method] :url'))

// Настройка JSON и CORS
app.use(json())
app.use(cors())

// Документация API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Маршруты
app.use('/events', eventRouter)
app.use('/users', userRouter)
app.use('/', baseRouter)

async function startServer() {
	try {
		await authDB()
		await syncDB()

		app.listen(port, () =>
			console.debug(`Сервер запущен на порту http://localhost:${port}`)
		)
	} catch (error) {
		console.error(`Ошибка при старте сервера: ${error}`)
		process.exit(1) // Завершение процесса с кодом ошибки
	}
}

startServer()
