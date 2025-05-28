import { Request, Response, NextFunction } from 'express';
import EventService from '../services/EventService.js';
import { AuthRequest } from '../types/express.js';

class EventController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const result = await EventService.getAllEvents(page, limit);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Необходима авторизация',
        });
        return;
      }

      const events = await EventService.getUserEvents(userId);

      res.status(200).json({
        status: 'success',
        data: events,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(parseInt(id));

      res.status(200).json({
        status: 'success',
        data: event,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('не найдено')) {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Необходима авторизация',
        });
        return;
      }

      const eventData = {
        ...req.body,
        createdBy: userId,
      };

      const newEvent = await EventService.createEvent(eventData);

      res.status(201).json({
        status: 'success',
        data: newEvent,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request & { user?: any }, res: Response): Promise<void> {
    console.log('EventController.update called');
    const userId = req.user?.id;
    console.log('req.user:', req.user);
    console.log('userId:', userId);
  
    if (!userId) {
      console.log('User ID missing in request');
      res.status(401).json({ status: 'error', message: 'Пользователь не найден' });
      return;
    }
  
    try {
      console.log(`Update event request: eventId=${req.params.id}, userId=${userId}`);
      console.log('Request body:', req.body);
  
      const updatedEvent = await EventService.updateEvent(Number(req.params.id), req.body, userId);
  
      console.log('Event updated successfully:', updatedEvent);
  
      res.json({ status: 'success', data: updatedEvent });
    } catch (error) {
      console.error('Error updating event:', error);
      let message = 'Неизвестная ошибка';
      if (error instanceof Error) message = error.message;
      res.status(400).json({ status: 'error', message });
      console.log('Response sent to client');
    }
  }
  
  

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const authReq = req as AuthRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Необходима авторизация',
        });
        return;
      }

      await EventService.deleteEvent(parseInt(id), userId);

      res.status(200).json({
        status: 'success',
        message: 'Мероприятие успешно удалено',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('не найдено')) {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
      } else if (error instanceof Error && error.message.includes('Нет прав')) {
        res.status(403).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }
}

export default new EventController();
