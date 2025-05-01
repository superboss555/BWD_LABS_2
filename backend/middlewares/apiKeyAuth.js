/**
 * Middleware для проверки API-ключа в заголовке запроса
 */
const apiKeyAuth = (req, res, next) => {
  // Получение API-ключа из заголовков запроса
  const apiKey = req.headers['x-api-key']
  
  // Получение разрешенного ключа из переменных окружения
  const validApiKey = process.env.API_KEY
  
  // Если ключ не предоставлен или неверный
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Неверный или отсутствующий API-ключ'
    })
  }
  
  // Если ключ верный, переходим к следующему middleware
  next()
}

export default apiKeyAuth 