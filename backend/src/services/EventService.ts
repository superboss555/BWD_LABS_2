import { Event } from '../models/index.js';
import { EventInstance, EventCreationAttributes } from '../types/models.js';

interface EventServiceResponse {
  events: EventInstance[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface EventUpdateResponse {
  current: EventInstance;
  previous: any;
}

class EventService {
  async getAllEvents(
    page: number = 1,
    limit: number = 10,
  ): Promise<EventServiceResponse> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Event.findAndCountAll({
      limit: parseInt(limit.toString()),
      offset: offset,
    });

    return {
      events: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page.toString()),
    };
  }

  async getEventById(id: number): Promise<EventInstance> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error(`Мероприятие с ID ${id} не найдено`);
    }
    return event;
  }

  async createEvent(
    eventData: EventCreationAttributes,
  ): Promise<EventInstance> {
    const { title, description, date, createdBy } = eventData;

    if (!title) {
      throw new Error('Необходимо указать название мероприятия');
    }
    if (!createdBy) {
      throw new Error('Необходимо указать создателя мероприятия');
    }

    return await Event.create({ title, description, date, createdBy });
  }

  async updateEvent(
    id: number,
    eventData: Partial<EventCreationAttributes>,
  ): Promise<EventUpdateResponse> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error(`Мероприятие с ID ${id} не найдено`);
    }

    const oldEvent = { ...event.toJSON() };
    const updatedEvent = await event.update(eventData);

    return {
      current: updatedEvent,
      previous: oldEvent,
    };
  }

  async deleteEvent(id: number, userId: number): Promise<boolean> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error(`Мероприятие с ID ${id} не найдено`);
    }

    if (event.createdBy !== userId) {
      throw new Error('Нет прав на удаление этого мероприятия');
    }

    await event.destroy();
    return true;
  }
}

export default new EventService();
