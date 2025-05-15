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

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await EventService.updateEvent(parseInt(id), req.body);

      res.status(200).json({
        status: 'success',
        data: result,
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
