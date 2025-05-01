import passport from '../configs/passport.js'

export const isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Ошибка аутентификации',
        error: err.message
      })
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Вы не авторизованы'
      })
    }
    
    // Добавляем пользователя в объект запроса
    req.user = user
    next()
  })(req, res, next)
} 