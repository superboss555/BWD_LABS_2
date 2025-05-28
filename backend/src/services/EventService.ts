import { Event } from '../models/index.js';
import { EventInstance, EventCreationAttributes } from '../types/models.js';
import EventModel from '../models/Event.ts';

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

  async getUserEvents(userId: number): Promise<EventInstance[]> {
    const events = await Event.findAll({
      where: {
        createdBy: userId,
      },
    });
    return events;
  }

  async getEventById(id: number): Promise<EventInstance> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error('Мероприятие не найдено');
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

    return await Event.create({ 
      title, 
      description, 
      date, 
      createdBy
    });
  }

  async updateEvent(eventId: number, eventData: Partial<EventInstance>, userId: number): Promise<EventInstance> {
    console.log(`EventService.updateEvent called with eventId=${eventId}, userId=${userId}`);
    try {
      const event = await this.getEventById(eventId);
      console.log('Found event:', event);
  
      if (event.createdBy !== userId) {
        const errorMsg = 'Нет прав на изменение этого мероприятия';
        console.log(errorMsg);
        throw new Error(errorMsg);
      }
  
      await event.update(eventData);
      console.log('Event updated in DB:', event);
  
      return event;
    } catch (error) {
      console.error('Error in EventService.updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: number, userId: number): Promise<void> {
    const event = await Event.findByPk(id);
    if (!event) {
      throw new Error('Мероприятие не найдено');
    }
    if (event.createdBy !== userId) {
      throw new Error('Нет прав на удаление этого мероприятия');
    }
    await event.destroy();
  }
}

export default new EventService();
