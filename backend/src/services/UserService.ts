import { User } from '../models/index.js';
import { UserInstance, UserCreationAttributes } from '../types/models.js';

class UserService {
  async getAllUsers(): Promise<UserInstance[]> {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      throw new Error('Пользователи не найдены');
    }

    return users;
  }

  async createUser(
    userData: Partial<UserCreationAttributes>,
  ): Promise<UserInstance> {
    const { name, email } = userData;

    if (!name || !email) {
      throw new Error('Необходимо указать имя и email пользователя');
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error(`Пользователь с email ${email} уже существует`);
    }

    return await User.create({
      name,
      email,
      password: userData.password || 'defaultPassword',
    });
  }
}

export default new UserService();
