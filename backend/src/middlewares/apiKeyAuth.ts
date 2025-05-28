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
  const apiKey = req.headers['x-api-key'] as string | undefined;
  const validApiKey = process.env.API_KEY;

  console.log('apiKeyAuth middleware called');
  console.log('Received API key:', apiKey);
  console.log('Expected API key:', validApiKey);

  if (!apiKey) {
    console.warn('API key is missing');
    res.status(401).json({
      status: 'error',
      message: 'Отсутствует API-ключ',
    });
    return;
  }

  if (apiKey !== validApiKey) {
    console.warn('Invalid API key');
    res.status(401).json({
      status: 'error',
      message: 'Неверный API-ключ',
    });
    return;
  }

  // Сохраняем API ключ в запросе для дальнейшего использования, если нужно
  req.apiKey = apiKey;

  console.log('API key is valid, proceeding to next middleware');
  next();
};

export default apiKeyAuth;
