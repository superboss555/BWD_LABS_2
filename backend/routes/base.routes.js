import { Router } from 'express'

const baseRouter = Router()

baseRouter.get('/', (req, res) => {
	res.json({ status: 'success', message: 'Домашняя страница' })
})

baseRouter.all('*', (req, res, next) => {
	next(new Error(`Несуществующий маршрут ${req.originalUrl}`))
})

export default baseRouter 