import { sequelize } from '../configs/db.js'
import { Sequelize } from 'sequelize'

const Event = sequelize.define(
	'event',
	{
		id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
			},
		},
		description: {
			type: Sequelize.STRING,
			allowNull: false,
			defaultValue: '',
		},
		date: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.NOW,
		},
		createdBy: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: 'user',
				key: 'id',
			},
		},
	},
	{
		// description = title, если он не указан
		hooks: {
			beforeCreate: (event, options) => {
				if (!event.description) {
					event.description = event.title
				}
			},
		},
	}
)

export default Event
