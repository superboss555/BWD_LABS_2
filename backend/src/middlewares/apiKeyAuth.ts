import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.js';

/**
 * Middleware для проверки API-ключа в заголовке запроса
 */
const apiKeyAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Получение API-ключа из заголовков запроса
  const apiKey = req.headers['x-api-key'] as string;

  // Получение разрешенного ключа из переменных окружения
  const validApiKey = process.env.API_KEY;

  // Если ключ не предоставлен или неверный
  if (!apiKey || apiKey !== validApiKey) {
    res.status(401).json({
      status: 'error',
      message: 'Неверный или отсутствующий API-ключ',
    });
    return;
  }

  // Сохраняем API ключ в запросе
  req.apiKey = apiKey;

  // Если ключ верный, переходим к следующему middleware
  next();
};

export default apiKeyAuth;
