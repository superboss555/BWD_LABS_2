import { Event } from '../models/index.js'

class EventService {
	async getAllEvents() {
		try {
			return await Event.findAll()
		} catch (error) {
			throw error
		}
	}

	async getEventById(id) {
		try {
			const event = await Event.findByPk(id)
			if (!event) {
				throw new Error(`Мероприятие с ID ${id} не найдено`)
			}
			return event
		} catch (error) {
			throw error
		}
	}

	async createEvent(eventData) {
		const { title, description, date, createdBy } = eventData

		if (!title) {
			throw new Error('Необходимо указать название мероприятия')
		}
		if (!createdBy) {
			throw new Error('Необходимо указать создателя мероприятия')
		}

		try {
			return await Event.create({ title, description, date, createdBy })
		} catch (error) {
			throw error
		}
	}

	async updateEvent(id, eventData) {
		try {
			const event = await Event.findByPk(id)
			if (!event) {
				throw new Error(`Мероприятие с ID ${id} не найдено`)
			}

			const oldEvent = { ...event.toJSON() }
			const updatedEvent = await event.update(eventData)

			return {
				current: updatedEvent,
				previous: oldEvent,
			}
		} catch (error) {
			throw error
		}
	}

	async deleteEvent(id) {
		try {
			const event = await Event.findByPk(id)
			if (!event) {
				throw new Error(`Мероприятие с ID ${id} не найдено`)
			}

			await event.destroy()
			return true
		} catch (error) {
			throw error
		}
	}
}

export default new EventService()
