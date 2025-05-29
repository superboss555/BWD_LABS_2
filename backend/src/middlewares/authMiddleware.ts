import type { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import type { AuthRequest } from '../types/express.js';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('--- isAuthenticated middleware start ---');
  console.log('Authorization header:', req.headers.authorization);

  passport.authenticate(
    'jwt',
    { session: false },
    (err: Error | null, user: any, info: any) => {
      if (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ message: 'Auth error' });
      }
      if (!user) {
        console.warn('Unauthorized: user not found or invalid token');
        console.warn('Authentication info:', info);
        return res.status(401).json({ message: 'Unauthorized' });
      }
      console.log('User authenticated:', user.email || user.id || user);
      (req as AuthRequest).user = user;
      console.log('--- isAuthenticated middleware end ---');
      next();
    },
  )(req, res, next);
};
