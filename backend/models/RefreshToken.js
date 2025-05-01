import { sequelize } from '../configs/db.js'
import { Sequelize } from 'sequelize'

const RefreshToken = sequelize.define('refreshToken', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  token: {
    type: Sequelize.STRING(500),
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false,
  }
}, {
  tableName: 'refresh_tokens',
  freezeTableName: true
})

export default RefreshToken 