import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { UserInstance, RefreshTokenInstance } from '../types/models.js';
import { AuthRequest } from '../types/express.js';

// Использовать значение из .env или использовать запасной ключ
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
// Время жизни токенов
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 минут

interface TokenPayload {
  id: number;
  email: string;
  name: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;
}

class AuthController {
  constructor() {
    // Привязываем методы к экземпляру класса, чтобы сохранить контекст this
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.generateTokens = this.generateTokens.bind(this);
  }

  // Метод для регистрации пользователя
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { email, name, password } = req.body;

      // Проверка наличия обязательных полей
      if (!email || !name || !password) {
        res.status(400).json({
          status: 'error',
          message: 'Email, имя и пароль обязательны',
        });
        return;
      }

      // Проверка существования пользователя с таким email
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        res.status(400).json({
          status: 'error',
          message: 'Пользователь с таким email уже существует',
        });
        return;
      }

      // Создание нового пользователя (пароль будет хеширован через beforeCreate хук)
      const newUser = (await User.create({
        email,
        name,
        password, // Хеширование произойдет автоматически в хуке
      })) as UserInstance;

      res.status(201).json({
        status: 'success',
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          },
        },
      });
    } catch (error) {
      console.error('Error in register:', error);
      next(error);
    }
  }

  // Метод для аутентификации пользователя и выдачи JWT и Refresh токенов
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      console.log(`Попытка входа с email: ${email}`);

      if (!email || !password) {
        console.log('Отсутствует email или пароль');
        res.status(400).json({
          status: 'error',
          message: 'Email и пароль обязательны',
        });
        return;
      }

      // Поиск пользователя по email
      const user = (await User.findOne({
        where: { email },
      })) as UserInstance | null;

      if (!user) {
        console.log(`Пользователь с email ${email} не найден`);
        res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
        return;
      }

      console.log(`Пользователь найден: ID=${user.id}, Name=${user.name}`);

      // Проверка пароля используя метод модели User
      const isPasswordValid = await user.comparePassword(password);

      console.log(
        `Результат проверки пароля: ${isPasswordValid ? 'верный' : 'неверный'}`,
      );

      if (!isPasswordValid) {
        res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
        return;
      }

      // Создание токенов с явным указанием на this
      const { accessToken, refreshToken } = await this.generateTokens(user);

      console.log(
        `Токены созданы. Access token действителен до: ${new Date(Date.now() + 15 * 60 * 1000)}`,
      );

      res.status(200).json({
        status: 'success',
        message: 'Аутентификация успешна',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error('Error in login:', error);
      next(error);
    }
  }

  // Метод для обновления access токена с помощью refresh токена
  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      console.log(`Попытка обновления токена: ${refreshToken}`);

      if (!refreshToken) {
        console.log('Refresh токен отсутствует в запросе');
        res.status(400).json({
          status: 'error',
          message: 'Refresh токен обязателен',
        });
        return;
      }

      // Проверяем refresh токен в базе данных
      const tokenRecord = (await RefreshToken.findOne({
        where: { token: refreshToken },
      })) as RefreshTokenInstance | null;

      console.log(
        'Результат поиска токена:',
        tokenRecord ? 'Найден' : 'Не найден',
      );

      if (!tokenRecord) {
        res.status(401).json({
          status: 'error',
          message: 'Недействительный refresh токен',
        });
        return;
      }

      // Проверяем срок действия
      if (new Date() > new Date(tokenRecord.expiresAt)) {
        console.log('Токен истек:', tokenRecord.expiresAt);
        // Удаляем просроченный токен
        await RefreshToken.destroy({ where: { token: tokenRecord.token } });

        res.status(401).json({
          status: 'error',
          message: 'Refresh токен истек',
        });
        return;
      }

      // Получаем пользователя по ID из токена
      const user = (await User.findByPk(
        tokenRecord.userId,
      )) as UserInstance | null;

      if (!user) {
        console.log(`Пользователь с ID ${tokenRecord.userId} не найден`);
        await RefreshToken.destroy({ where: { token: tokenRecord.token } });
        res.status(401).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
        return;
      }

      console.log(`Пользователь найден: ID=${user.id}, Name=${user.name}`);

      // Удаляем старый refresh токен
      await RefreshToken.destroy({ where: { token: tokenRecord.token } });

      // Создаем новые токены
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);

      console.log('Новые токены созданы:', {
        newRefreshToken: newRefreshToken.slice(0, 10) + '...',
      });

      res.status(200).json({
        status: 'success',
        message: 'Токены успешно обновлены',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      next(error);
    }
  }

  // Метод для выхода пользователя из системы (удаление refresh токена)
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          status: 'error',
          message: 'Refresh токен обязателен',
        });
        return;
      }

      // Находим и удаляем refresh токен
      const tokenRecord = await RefreshToken.findOne({
        where: { token: refreshToken },
      });

      if (tokenRecord) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
      }

      res.status(200).json({
        status: 'success',
        message: 'Выход выполнен успешно',
      });
    } catch (error) {
      console.error('Error in logout:', error);
      next(error);
    }
  }

  // Метод для генерации новых токенов
  async generateTokens(user: UserInstance): Promise<TokenResponse> {
    try {
      // Создаем данные для access токена
      const payload: TokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      // Генерируем access токен
      const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      // Генерируем refresh токен (uuid)
      const refreshToken = uuidv4();

      // Устанавливаем срок действия refresh токена
      const refreshTokenExpiry = new Date();
      refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 дней

      // Удаляем старые refresh токены пользователя (опционально)
      await RefreshToken.destroy({ where: { userId: user.id } });

      // Сохраняем refresh токен в базу данных
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshTokenExpiry,
      });

      return { accessToken, refreshToken, refreshTokenExpiry };
    } catch (error) {
      console.error('Error in generateTokens:', error);
      throw error;
    }
  }

  // Метод для получения профиля пользователя
  async getProfile(req: Request, res: Response): Promise<void> {
    const authReq = req as AuthRequest;
    res.status(200).json({
      status: 'success',
      message: 'Профиль пользователя',
      data: {
        user: authReq.user,
      },
    });
  }
}

export default new AuthController();
