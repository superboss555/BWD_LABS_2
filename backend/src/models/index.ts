import User from './User.js';
import Event from './Event.js';
import RefreshToken from './RefreshToken.js';
import EventParticipant from './EventParticipant.js'; // импорт модели участников
import bcrypt from 'bcryptjs';
import { UserInstance } from '../types/models.js';

// Определение связей между моделями
User.hasMany(Event, { foreignKey: 'createdBy' });
Event.belongsTo(User, { foreignKey: 'createdBy' });

// Связь между User и RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId' });
RefreshToken.belongsTo(User, { foreignKey: 'userId' });

// Связь многие-ко-многим между User и Event через EventParticipant
User.belongsToMany(Event, {
  through: EventParticipant,
  foreignKey: 'userId',
  otherKey: 'eventId',
  as: 'participatedEvents', // опционально, для удобства
});
Event.belongsToMany(User, {
  through: EventParticipant,
  foreignKey: 'eventId',
  otherKey: 'userId',
  as: 'participants', // опционально, для удобства
});

// **Добавляем связи для EventParticipant и User**
EventParticipant.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasMany(EventParticipant, { foreignKey: 'userId', as: 'EventParticipants' });

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

export { User, Event, RefreshToken, EventParticipant };
