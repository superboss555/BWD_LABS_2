import type { Request, Response, NextFunction } from 'express';

export const logTokenForParticipants = (req: Request, _res: Response, next: NextFunction) => {
  // Логируем только для маршрутов получения участников (например, GET /events/:eventId/participants)
  if (req.method === 'GET' && req.path.match(/^\/\d+\/participants$/)) {
    console.log('\n' + '='.repeat(80));
    console.log('🔥🔥🔥 TOKEN LOGGING FOR PARTICIPANTS 🔥🔥🔥');
    console.log('EXPECTED: Authorization header with Bearer token');
    console.log('RECEIVED Authorization header:', req.headers.authorization);
    console.log('REQUEST PATH:', req.originalUrl);
    console.log('='.repeat(80) + '\n');
  }
  next();
};
