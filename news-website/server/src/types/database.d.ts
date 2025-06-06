import { Dialect } from 'sequelize/types';

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging?: boolean | ((sql: string, timing?: number) => void);
  pool?: {
    max?: number;
    min?: number;
    acquire?: number;
    idle?: number;
  };
  define?: {
    underscored?: boolean;
    timestamps?: boolean;
    freezeTableName?: boolean;
    paranoid?: boolean;
    createdAt?: string | boolean;
    updatedAt?: string | boolean;
    deletedAt?: string | boolean;
  };
  retry?: {
    max?: number;
  };
  dialectOptions?: {
    ssl?: boolean | {
      require?: boolean;
      rejectUnauthorized?: boolean;
    };
  };
  timezone?: string;
}
