import EventService from '../services/EventService.js'

class EventController {
	async getAll(req, res, next) {
		try {
			const { page = 1, limit = 10 } = req.query;
			const events = await EventService.getAllEvents(page, limit);

			res.status(200).json({
				status: 'success',
				data: events,
			})
		} catch (error) {
			next(error)
		}
	}

	async getOne(req, res, next) {
		try {
			const event = await EventService.getEventById(req.params.id)

			res.status(200).json({
				status: 'success',
				data: event,
			})
		} catch (error) {
			next(error)
		}
	}

	async create(req, res, next) {
		try {
			const event = await EventService.createEvent(req.body)

			res.status(201).json({
				status: 'success',
				message: 'Мероприятие успешно создано',
				data: event,
			})
		} catch (error) {
			next(error)
		}
	}

	async update(req, res, next) {
		try {
			const result = await EventService.updateEvent(req.params.id, req.body)

			res.status(200).json({
				status: 'success',
				message: 'Мероприятие успешно обновлено',
				data: result,
			})
		} catch (error) {
			next(error)
		}
	}

	async delete(req, res, next) {
		try {
			await EventService.deleteEvent(req.params.id)

			res.status(200).json({
				status: 'success',
				message: 'Мероприятие успешно удалено',
			})
		} catch (error) {
			next(error)
		}
	}
}

export default new EventController()
