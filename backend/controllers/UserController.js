import UserService from '../services/UserService.js'

class UserController {
	async getAll(req, res, next) {
		try {
			const users = await UserService.getAllUsers()

			res.status(200).json({
				status: 'success',
				data: users,
			})
		} catch (error) {
			next(error)
		}
	}

	async create(req, res, next) {
		try {
			const user = await UserService.createUser(req.body)

			res.status(201).json({
				status: 'success',
				message: 'Пользователь успешно создан',
				data: user,
			})
		} catch (error) {
			next(error)
		}
	}
}

export default new UserController()
