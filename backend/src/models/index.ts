import User from './User.js';
import Event from './Event.js';
import RefreshToken from './RefreshToken.js';
import bcrypt from 'bcryptjs';
import { UserInstance } from '../types/models.js';

// Определение связей между моделями
User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy' });

// Связь между User и RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// Хуки для шифрования пароля
User.beforeCreate(async (user: UserInstance) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user: UserInstance) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

export { User, Event, RefreshToken };
