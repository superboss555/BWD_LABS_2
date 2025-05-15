import { sequelize } from '../configs/db.js';
import { DataTypes } from 'sequelize';
import { RefreshTokenInstance } from '../types/models.js';

const RefreshToken = sequelize.define<RefreshTokenInstance>(
  'refreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'refresh_tokens',
    freezeTableName: true,
  },
);

export default RefreshToken;
