import { Router, Request, Response, NextFunction } from 'express';
import eventParticipantController from '../controllers/EventParticipantController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import type { AuthRequest } from '../types/express.js';

const router = Router();

// Получить количество участников мероприятия
router.get(
  '/:eventId/participants/count',
  isAuthenticated,
  asyncHandler((req, res, next) => {
    console.log(`[Route] GET /events/${req.params.eventId}/participants/count`);
    console.log('Headers:', req.headers);
    console.log('User:', (req as AuthRequest).user);
    return eventParticipantController.getParticipantsCount(req as AuthRequest, res, next);
  }),
);

// Получить список участников мероприятия
router.get(
    '/:eventId/participants',
    asyncHandler((req: Request, res: Response, next: NextFunction) => {
      console.log('\n' + '='.repeat(80));
      console.log(`🔥🔥🔥 [Route] GET /events/${req.params.eventId}/participants 🔥🔥🔥`);
      console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
      console.log('Authenticated User:', JSON.stringify((req as AuthRequest).user, null, 2));
      console.log('Request Params:', req.params);
      console.log('='.repeat(80) + '\n');
  
      return eventParticipantController.getEventParticipants(req as AuthRequest, res, next);
    }),
  );
  

// Проверить участие пользователя в мероприятии (требует авторизации)
router.get(
  '/:eventId/participation',
  isAuthenticated,
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Route] GET /events/${req.params.eventId}/participation`);
    console.log('Headers:', req.headers);
    console.log('User:', (req as AuthRequest).user);
    return eventParticipantController.checkParticipation(req as AuthRequest, res, next);
  }),
);

// Зарегистрироваться на мероприятие (требует авторизации)
router.post(
  '/:eventId/participants',
  isAuthenticated,
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Route] POST /events/${req.params.eventId}/participants`);
    console.log('Headers:', req.headers);
    console.log('User:', (req as AuthRequest).user);
    return eventParticipantController.addParticipant(req as AuthRequest, res, next);
  }),
);

// Отменить участие в мероприятии (требует авторизации)
router.delete(
  '/:eventId/participants',
  isAuthenticated,
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    console.log(`[Route] DELETE /events/${req.params.eventId}/participants`);
    console.log('Headers:', req.headers);
    console.log('User:', (req as AuthRequest).user);
    return eventParticipantController.removeParticipant(req as AuthRequest, res, next);
  }),
);

export default router;
