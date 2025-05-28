import type { User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/localStorage';

// Синглтон для отслеживания состояния авторизации
class AuthState {
  private static instance: AuthState;
  private _isAuthenticated: boolean = false;
  private _userData: User | null = null;

  private constructor() {
    // Проверяем, есть ли уже пользователь в localStorage
    this.checkInitialAuth();
  }

  public static getInstance(): AuthState {
    if (!AuthState.instance) {
      AuthState.instance = new AuthState();
    }
    return AuthState.instance;
  }

  private checkInitialAuth(): void {
    try {
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr) as User;
        this._userData = userData;
        this._isAuthenticated = true;
      } else {
        this._isAuthenticated = false;
        this._userData = null;
      }
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      this._isAuthenticated = false;
      this._userData = null;
    }
  }

  public get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  public get userData(): User | null {
    return this._userData;
  }

  public set isAuthenticated(value: boolean) {
    this._isAuthenticated = value;
    // Отправляем событие об изменении состояния авторизации
    window.dispatchEvent(new CustomEvent('auth_state_changed', { detail: value }));
  }

  public login(user: User): void {
    this._userData = user;
    this.isAuthenticated = true;
  }

  public logout(): void {
    this._userData = null;
    this.isAuthenticated = false;
  }
}

export default AuthState.getInstance(); 