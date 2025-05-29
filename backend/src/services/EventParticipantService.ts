import EventParticipant from '../models/EventParticipant.js';
import User from '../models/User.js'; // Импорт модели User для join

class EventParticipantService {
  async getParticipantsCount(eventId: number): Promise<number> {
    console.log(`[Service] Подсчёт участников для eventId=${eventId}`);
    try {
      const count = await EventParticipant.count({ where: { eventId } });
      console.log(`[Service] Получено количество участников: ${count}`);
      return count;
    } catch (error) {
      console.error('[Service] Ошибка при подсчёте участников:', error);
      throw error;
    }
  }

  async addParticipant(eventId: number, userId: number): Promise<void> {
    console.log(`[Service] Добавление участника userId=${userId} в eventId=${eventId}`);
    try {
      await EventParticipant.create({ eventId, userId });
      console.log('[Service] Участник добавлен успешно');
    } catch (error) {
      console.error('[Service] Ошибка при добавлении участника:', error);
      throw error;
    }
  }

  async removeParticipant(eventId: number, userId: number): Promise<void> {
    console.log(`[Service] Удаление участника userId=${userId} из eventId=${eventId}`);
    try {
      await EventParticipant.destroy({ where: { eventId, userId } });
      console.log('[Service] Участник удалён успешно');
    } catch (error) {
      console.error('[Service] Ошибка при удалении участника:', error);
      throw error;
    }
  }

  // Исправленный метод с join по User для получения имени и email участников
  async getEventParticipants(eventId: number): Promise<any[]> {
    console.log(`[Service] Получение участников для eventId=${eventId}`);
    try {
      const participants = await EventParticipant.findAll({
        where: { eventId },
        include: [{
          model: User,
          as: 'User',
          attributes: ['name', 'email'], // выбираем только нужные поля
        }],
      });
      console.log(`[Service] Найдено участников: ${participants.length}`);
      return participants;
    } catch (error) {
      console.error('[Service] Ошибка при получении участников:', error);
      throw error;
    }
  }

  async isParticipant(eventId: number, userId: number): Promise<boolean> {
    console.log(`[Service] Проверка участия userId=${userId} в eventId=${eventId}`);
    try {
      const count = await EventParticipant.count({ where: { eventId, userId } });
      const isPart = count > 0;
      console.log(`[Service] Пользователь является участником: ${isPart}`);
      return isPart;
    } catch (error) {
      console.error('[Service] Ошибка при проверке участия:', error);
      throw error;
    }
  }
}

export default new EventParticipantService();
