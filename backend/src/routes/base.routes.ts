import { Router, Request, Response, NextFunction } from 'express';

const baseRouter = Router();

baseRouter.get('/', (req: Request, res: Response) => {
  res.json({ status: 'success', message: 'Домашняя страница' });
});

baseRouter.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new Error(`Несуществующий маршрут ${req.originalUrl}`));
});

export default baseRouter;
