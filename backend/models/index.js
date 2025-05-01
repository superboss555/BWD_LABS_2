import User from './User.js'
import Event from './Event.js'
import bcrypt from 'bcrypt'

User.hasMany(Event, { foreignKey: 'createdBy' })
Event.belongsTo(User, { foreignKey: 'createdBy' })


User.beforeCreate(async (user) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10)
    }
})


User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }
})

export { User, Event }
