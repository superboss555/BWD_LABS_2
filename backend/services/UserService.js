import { User } from '../models/index.js'

class UserService {
	async getAllUsers() {
		try {
			const users = await User.findAll()

			if (!users || users.length === 0) {
				throw new Error('Пользователи не найдены')
			}

			return users
		} catch (error) {
			throw error
		}
	}

	async createUser(userData) {
		const { name, email } = userData

		if (!name || !email) {
			throw new Error('Необходимо указать имя и email пользователя')
		}

		try {
			const existingUser = await User.findOne({ where: { email } })
			if (existingUser) {
				throw new Error(`Пользователь с email ${email} уже существует`)
			}

			return await User.create({ name, email })
		} catch (error) {
			throw error
		}
	}
}

export default new UserService()
