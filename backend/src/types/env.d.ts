declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_HOST: string;
      DB_PORT: string;
      API_KEY: string;
      JWT_SECRET: string;
      JWT_EXPIRATION: string;
      JWT_REFRESH_EXPIRATION: string;
      RESET_DATABASE: string;
    }
  }
}
