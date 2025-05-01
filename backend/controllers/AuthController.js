import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/index.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Использовать значение из .env или использовать запасной ключ
const JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "test_refresh_secret_key";
// Время жизни токенов
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 минут
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 дней

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
  async register(req, res, next) {
    try {
      const { email, name, password } = req.body;
      
      // Проверка наличия обязательных полей
      if (!email || !name || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email, имя и пароль обязательны',
        });
      }
      
      // Проверка существования пользователя с таким email
      const existingUser = await User.findOne({ where: { email } });
      
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Пользователь с таким email уже существует',
        });
      }
      
      // Создание нового пользователя (пароль будет хеширован через beforeCreate хук)
      const newUser = await User.create({
        email,
        name,
        password, // Хеширование произойдет автоматически в хуке
      });
      
      res.status(201).json({
        status: 'success',
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
          }
        },
      });
    } catch (error) {
      console.error('Error in register:', error);
      next(error);
    }
  }

  // Метод для аутентификации пользователя и выдачи JWT и Refresh токенов
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      console.log(`Попытка входа с email: ${email}`);
      
      if (!email || !password) {
        console.log('Отсутствует email или пароль');
        return res.status(400).json({
          status: 'error',
          message: 'Email и пароль обязательны',
        });
      }
      
      // Поиск пользователя по email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        console.log(`Пользователь с email ${email} не найден`);
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }
      
      console.log(`Пользователь найден: ID=${user.id}, Name=${user.name}`);
      
      // Проверка пароля используя метод модели User
      const isPasswordValid = await user.comparePassword(password);
      
      console.log(`Результат проверки пароля: ${isPasswordValid ? 'верный' : 'неверный'}`);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }
      
      // Создание токенов с явным указанием на this
      const { accessToken, refreshToken, refreshTokenExpiry } = await this.generateTokens(user);
      
      console.log(`Токены созданы. Access token действителен до: ${new Date(Date.now() + 15 * 60 * 1000)}`);
      
      res.status(200).json({
        status: 'success',
        message: 'Аутентификация успешна',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        },
      });
    } catch (error) {
      console.error('Error in login:', error);
      next(error);
    }
  }
  
  // Метод для обновления access токена с помощью refresh токена
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      console.log(`Попытка обновления токена: ${refreshToken}`);
      
      if (!refreshToken) {
        console.log('Refresh токен отсутствует в запросе');
        return res.status(400).json({
          status: 'error',
          message: 'Refresh токен обязателен',
        });
      }
      
      // Проверяем refresh токен в базе данных
      const tokenRecord = await RefreshToken.findOne({ 
        where: { token: refreshToken }
      });
      
      console.log('Результат поиска токена:', tokenRecord ? 'Найден' : 'Не найден');
      
      if (!tokenRecord) {
        return res.status(401).json({
          status: 'error',
          message: 'Недействительный refresh токен',
        });
      }
      
      // Проверяем срок действия
      if (new Date() > new Date(tokenRecord.expiresAt)) {
        console.log('Токен истек:', tokenRecord.expiresAt);
        // Удаляем просроченный токен
        await tokenRecord.destroy();
        
        return res.status(401).json({
          status: 'error',
          message: 'Refresh токен истек',
        });
      }
      
      // Получаем пользователя по ID из токена
      const user = await User.findByPk(tokenRecord.userId);
      
      if (!user) {
        console.log(`Пользователь с ID ${tokenRecord.userId} не найден`);
        await tokenRecord.destroy();
        return res.status(401).json({
          status: 'error',
          message: 'Пользователь не найден',
        });
      }
      
      console.log(`Пользователь найден: ID=${user.id}, Name=${user.name}`);
      
      // Удаляем старый refresh токен
      await tokenRecord.destroy();
      
      // Создаем новые токены
      const { accessToken, refreshToken: newRefreshToken, refreshTokenExpiry } = 
        await this.generateTokens(user);
      
      console.log('Новые токены созданы:', {
        newRefreshToken: newRefreshToken.slice(0, 10) + '...',
        expiresAt: refreshTokenExpiry
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
            email: user.email
          }
        },
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      next(error);
    }
  }
  
  // Метод для выхода пользователя (удаление refresh токена)
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Refresh токен обязателен',
        });
      }
      
      // Удаляем refresh токен из БД
      await RefreshToken.destroy({ where: { token: refreshToken } });
      
      res.status(200).json({
        status: 'success',
        message: 'Успешный выход из системы',
      });
    } catch (error) {
      console.error('Error in logout:', error);
      next(error);
    }
  }
  
  // Вспомогательный метод для генерации токенов
  async generateTokens(user) {
    console.log(`Генерация токенов для пользователя: ID=${user.id}, Name=${user.name}`);
    
    // Создание access токена
    const accessToken = jwt.sign(
      { 
        id: user.id,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    // Создание refresh токена
    const refreshToken = uuidv4();
    
    // Вычисляем expiry date для refresh токена
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 дней
    
    console.log('Сохранение refresh токена в БД:', {
      userId: user.id,
      token: refreshToken.slice(0, 10) + '...',
      expiresAt: refreshTokenExpiry
    });
    
    // Удаляем старые refresh токены пользователя
    await RefreshToken.destroy({
      where: { userId: user.id }
    });
    
    // Сохраняем refresh токен в БД
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiry
    });
    
    return { accessToken, refreshToken, refreshTokenExpiry };
  }
  
  // Защищенный метод для проверки работы JWT аутентификации
  async getProfile(req, res) {
    // Если мы здесь, значит JWT прошел валидацию и пользователь аутентифицирован
    const user = req.user;
    
    res.status(200).json({
      status: 'success',
      message: 'Пользователь аутентифицирован',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
    });
  }
}

export default new AuthController(); 