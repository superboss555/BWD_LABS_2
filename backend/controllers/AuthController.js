import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';

// Использовать значение из .env или использовать запасной ключ
const JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_key";

class AuthController {
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
      
      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Создание нового пользователя
      const newUser = await User.create({
        email,
        name,
        password: hashedPassword,
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

  // Метод для аутентификации пользователя и выдачи JWT
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email и пароль обязательны',
        });
      }
      
      // Поиск пользователя по email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }
      
      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Неверный email или пароль',
        });
      }
      
      // Создание JWT токена
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Аутентификация успешна',
        data: {
          token,
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