import { sequelize } from '../configs/db.js';
import { DataTypes } from 'sequelize';
import { EventInstance } from '../types/models.js';

const Event = sequelize.define<EventInstance>(
  'event',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    // description = title, если он не указан
    hooks: {
      beforeCreate: (event: EventInstance) => {
        if (!event.description) {
          event.description = event.title;
        }
      },
    },
  },
);

export default Event;
