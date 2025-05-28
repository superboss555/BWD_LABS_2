import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest } from '../types/express.js'; // если есть свой тип с user

export const isAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  console.log('Custom isAuthenticated middleware called');
  passport.authenticate('jwt', { session: false }, (err: Error | null, user: any, info: any) => {
    if (err) {
      console.error('Auth error:', err);
      return res.status(500).json({ message: 'Auth error' });
    }
    if (!user) {
      console.warn('User not authenticated');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    console.log('User authenticated:', user.email || user.id);
    next();
  })(req, res, next);
};
