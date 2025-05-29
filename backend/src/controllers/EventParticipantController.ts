import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express.js';
import eventParticipantService from '../services/EventParticipantService.js';

class EventParticipantController {
  async addParticipant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Некорректный ID мероприятия' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Необходима авторизация' });
        return;
      }

      await eventParticipantService.addParticipant(eventId, userId);
      res.status(200).json({ message: 'Вы успешно зарегистрировались на мероприятие' });
    } catch (error) {
      next(error);
    }
  }

  async removeParticipant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Некорректный ID мероприятия' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Необходима авторизация' });
        return;
      }

      await eventParticipantService.removeParticipant(eventId, userId);
      res.status(200).json({ message: 'Вы отменили участие в мероприятии' });
    } catch (error) {
      next(error);
    }
  }

  async getEventParticipants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Некорректный ID мероприятия' });
        return;
      }

      const participants = await eventParticipantService.getEventParticipants(eventId);
      res.status(200).json(participants);
    } catch (error) {
      next(error);
    }
  }

  async getParticipantsCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Некорректный ID мероприятия' });
        return;
      }

      const count = await eventParticipantService.getParticipantsCount(eventId);
      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }

  async checkParticipation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        res.status(400).json({ message: 'Некорректный ID мероприятия' });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Необходима авторизация' });
        return;
      }

      const isParticipant = await eventParticipantService.isParticipant(eventId, userId);
      res.status(200).json({ isParticipant });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventParticipantController();
