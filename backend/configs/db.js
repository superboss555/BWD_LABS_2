import { Sequelize } from 'sequelize'
import 'dotenv/config'

const db_name = process.env.DB_NAME
const db_user = process.env.DB_USER
const db_password = process.env.DB_PASSWORD
const db_host = process.env.DB_HOST
const db_port = process.env.DB_PORT

const sequelize = new Sequelize(db_name, db_user, db_password, {
	host: db_host,
	port: db_port,
	dialect: 'postgres',
	logging: console.log // Включаем логирование SQL запросов
})

const authDB = async () => {
	try {
		await sequelize.authenticate()
		console.debug('Соединение с БД установлено!')
	} catch (error) {
		console.debug(`Соединение с БД не установлено. Ошибка: ${error}`)
		throw error // Пробросим ошибку дальше
	}
}

// Параметр force указывает, нужно ли пересоздавать таблицы
const syncDB = async (force = false) => {
	try {
		await sequelize.sync({ force })
		console.debug(`Таблицы синхронизированы! ${force ? '(с пересозданием)' : ''}`)
	} catch (error) {
		console.debug(`Таблицы не синхронизированы. Ошибка: ${error}`)
		throw error // Пробросим ошибку дальше
	}
}

const seedDB = async () => {
	try {
		console.debug('Начинаем заполнение базы данных...')
		
		// Импортируем модели
		const { User, Event } = await import('../models/index.js')
		
		// Проверяем, есть ли уже данные в таблицах
		const userCount = await User.count()
		const eventCount = await Event.count()
		
		console.debug(`Текущее количество записей: пользователей - ${userCount}, мероприятий - ${eventCount}`)
		
		if (userCount > 0 || eventCount > 0) {
			console.debug('База данных уже содержит данные, заполнение пропущено')
			return
		}
		
		// Создаем тестовых пользователей
		console.debug('Создаем пользователей...')
		const users = await User.bulkCreate([
			{ name: 'Иван Иванов', email: 'ivan@example.com' },
			{ name: 'Мария Петрова', email: 'maria@example.com' },
			{ name: 'Алексей Сидоров', email: 'alex@example.com' },
			{ name: 'Екатерина Смирнова', email: 'kate@example.com' },
			{ name: 'Дмитрий Козлов', email: 'dmitry@example.com' }
		])
		
		console.debug(`Создано ${users.length} пользователей`)
		
		// Текущая дата
		const now = new Date()
		
		// Создаем тестовые мероприятия
		console.debug('Создаем мероприятия...')
		const events = await Event.bulkCreate([
			{
				title: 'Конференция по веб-разработке',
				description: 'Ежегодная конференция по современным веб-технологиям',
				date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // через неделю
				createdBy: users[0].id
			},
			{
				title: 'Мастер-класс по JavaScript',
				description: 'Практический мастер-класс по продвинутому JavaScript',
				date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // через 3 дня
				createdBy: users[1].id
			},
			{
				title: 'Хакатон по разработке мобильных приложений',
				description: 'Трехдневный хакатон для разработчиков мобильных приложений',
				date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // через 2 недели
				createdBy: users[2].id
			},
			{
				title: 'Вебинар: Основы React',
				description: 'Вводный вебинар по библиотеке React',
				date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // через 5 дней
				createdBy: users[0].id
			},
			{
				title: 'Встреча группы разработчиков Node.js',
				description: 'Ежемесячная встреча сообщества Node.js разработчиков',
				date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // через 10 дней
				createdBy: users[3].id
			},
			{
				title: 'Семинар по базам данных',
				description: 'Углубленный семинар по оптимизации баз данных',
				date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // через 6 дней
				createdBy: users[2].id
			},
			{
				title: 'Мастер-класс по Docker',
				description: 'Практическое введение в Docker и контейнеризацию',
				date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // через 12 дней
				createdBy: users[4].id
			},
			{
				title: 'Лекция по кибербезопасности',
				description: 'Современные угрозы и методы защиты веб-приложений',
				date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // через 4 дня
				createdBy: users[1].id
			},
			{
				title: 'Воркшоп по дизайну интерфейсов',
				description: 'Практические приемы создания удобных пользовательских интерфейсов',
				date: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // через 9 дней
				createdBy: users[3].id
			},
			{
				title: 'Конференция по искусственному интеллекту',
				description: 'Последние достижения в области ИИ и машинного обучения',
				date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // через 3 недели
				createdBy: users[4].id
			},
			{
				title: 'Митап по TypeScript',
				description: 'Обмен опытом и лучшими практиками при работе с TypeScript',
				date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // через 15 дней
				createdBy: users[2].id
			},
			{
				title: 'Курс по GraphQL',
				description: 'Введение в GraphQL и его использование с React и Node.js',
				date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // через 8 дней
				createdBy: users[0].id
			}
		])
		
		console.debug(`Создано ${events.length} мероприятий`)
		console.debug('База данных успешно заполнена тестовыми данными')
		
		return { users, events }
	} catch (error) {
		console.error(`Ошибка при заполнении базы данных: ${error}`)
		throw error // Пробросим ошибку дальше
	}
}

// Функция для очистки и пересоздания базы с тестовыми данными
const resetAndSeedDB = async () => {
	try {
		console.debug('Начинаем сброс и повторное заполнение базы данных...')
		
		// Синхронизируем с force: true для пересоздания таблиц
		await syncDB(true)
		
		// Заполняем заново
		const result = await seedDB()
		
		console.debug('Сброс и заполнение базы данных завершены успешно')
		return result
	} catch (error) {
		console.error(`Ошибка при сбросе и заполнении базы данных: ${error}`)
		throw error
	}
}

export { sequelize, authDB, syncDB, seedDB, resetAndSeedDB }
