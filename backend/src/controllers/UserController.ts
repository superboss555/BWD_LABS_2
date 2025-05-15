import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService.js';

class UserController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await UserService.createUser(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('уже существует')) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }
}

export default new UserController();
