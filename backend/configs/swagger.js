import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import 'dotenv/config'

const port = process.env.APP_PORT

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Event API & User API',
			version: '1.0.0',
			description: 'API для управления мероприятиями и пользователями',
		},
		servers: [
			{
				url: `http://localhost:${port}`,
				description: 'Dev',
			},
		],
	},
	apis: ['./routes/*.js'],
}

const specs = swaggerJsdoc(options)

export { specs, swaggerUi }
