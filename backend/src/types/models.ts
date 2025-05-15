import { Model, Optional } from 'sequelize';

// User Types
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Event Types
export interface EventAttributes {
  id: number;
  title: string;
  description: string;
  date: Date;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventCreationAttributes
  extends Optional<EventAttributes, 'id' | 'description'> {}

export interface EventInstance
  extends Model<EventAttributes, EventCreationAttributes>,
    EventAttributes {}

// RefreshToken Types
export interface RefreshTokenAttributes {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, 'id'> {}

export interface RefreshTokenInstance
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>,
    RefreshTokenAttributes {}
