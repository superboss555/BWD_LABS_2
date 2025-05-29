import { sequelize } from '../configs/db.js';
import { DataTypes } from 'sequelize';

const EventParticipant = sequelize.define(
  'event_participant',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['eventId', 'userId'],
      },
    ],
  },
);

export default EventParticipant;