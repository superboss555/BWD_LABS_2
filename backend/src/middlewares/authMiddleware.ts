import { Response, NextFunction } from 'express';
import passport from '../configs/passport.js';
import { AuthRequest } from '../types/express.js';

export const isAuthenticated = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: any) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        message: 'Ошибка аутентификации',
        error: err.message,
      });
      return;
    }

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Вы не авторизованы',
      });
      return;
    }

    req.user = user;
    next();
  })(req, res, next);
};
