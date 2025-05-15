import { UserInstance } from './models.js';
import { Request } from 'express';

// Настраиваемый интерфейс запроса с аутентификацией
export interface AuthRequest extends Request {
  user?: UserInstance;
  apiKey?: string;
}
