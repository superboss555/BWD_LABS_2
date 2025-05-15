Лютоев Андрей Юльевич ПрИ-22

Лаба 1 тестирование через Postman:

    1) Запрос на апи:
    curl -H "x-api-key: qwerty1" http://localhost:3000/events

    2) общий запрос:
    curl -H "x-api-key: qwerty1" http://localhost:3000/events?page=2&limit=3
  
  Лаба 2 тестирование через Postman:

    1) Запрос на отправку данных JWT
    POST    http://localhost:3000/auth/login    
    (использовать Body -> raw)
    {
        "email": "ivan@example.com",
        "password": "password123"
    }

    2) Запрос на получение данных JWT
    GET     http://localhost:3000/auth/test
    (использовать Authorisation -> Bearer token)
    Вставить токен, полученный в пункте 1

    3) Запрос на регистрацию:
    POST    http://localhost:3000/auth/register
    (использовать Body -> raw)
    {
        "email": "test@example.com",
        "name": "Тестовый Пользователь",
        "password": "password123"
    }

    4) Запрос на вход:
    POST    http://localhost:3000/auth/login    
    (использовать Body -> raw)
    {
        "email": "ivan@example.com",
        "password": "password123"
    }

    5) Проверка на защиту маршрутов:

        Правильный запрос:
        GET http://localhost:3000/events
        Ошибка 401 (не авторизован):
        GET http://localhost:3000/events/1
        POST http://localhost:3000/events

        Получение токена:
        POST http://localhost:3000/auth/login
        {
            "email": "ivan@example.com",
            "password": "password123"
        }

        Работа с токеном:
        GET http://localhost:3000/events/1
        <токен> 
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpdmFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ2MTExMjUzLCJleHAiOjE3NDYxMTQ4NTN9._YIVGYxp_UuUrIySZSYOIKOTigQ8aUDuCfYVeQjlPqg

        POST http://localhost:3000/events
        <токен> 
        {
            "title": "Новое мероприятие2",
            "description": "Описание мероприятия2",
            "date": "2023-12-31T18:00:00.000Z",
            "createdBy": 2
        }

        PUT http://localhost:3000/events/2
        <токен> 
        {
            "title": "Новое мероприятие1_2",
            "description": "Описание мероприятия1",
            "date": "2023-12-31T18:00:00.000Z",
            "createdBy": 2
        }

        DELETE http://localhost:3000/events/2
        <токен> 

    6) Проверка изменения токена:
    
        POST http://localhost:3000/auth/login
        {
            "email": "user@example.com",
            "password": "password123"
        }

        получили токен: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJpdmFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ2MTEzMzU0LCJleHAiOjE3NDYxMTQyNTR9.svLjOJOkuZYKJu-jRp0QXE9xl3PnFtmOIyefOBP7m6k

        получили refresh token: 7b0e89f1-7f23-4272-99d7-ced9bc860d05
        
        GET http://localhost:3000/auth/profile
        <токен>

        Обновляем токены:

        POST http://localhost:3000/auth/refresh
        {
            "refreshToken": "токен"
        }

        обновленные токены:
        
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ2MTEzOTgyLCJleHAiOjE3NDYxMTQ4ODJ9.ghFsVblrcY5Oux_qW3fW2L3hJarfpDGa9XUb-QsGK34"
        
        "refreshToken": "90bead8b-ba59-494a-be17-80d49a14e159"





        
Лаба 3

    1) команды для проверки:

        npm run tsc
        npm run lint
        npm run format
        npm run check




    

