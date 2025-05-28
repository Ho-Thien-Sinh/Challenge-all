import { Model, DataTypes } from 'sequelize';
import { hash } from 'bcryptjs';

export class ModelUtils {
  /**
   * Parse JSON field from database
   * @param value Raw value from database
   * @returns Parsed array or empty array if invalid
   */
  static parseJsonArray(value: unknown): any[] {
    if (Array.isArray(value)) {
      return value;
    }
    try {
      return value ? JSON.parse(value as string) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Stringify array to JSON for database storage
   * @param value Array to stringify
   * @returns JSON string or empty array string if invalid
   */
  static stringifyJsonArray(value: unknown): string {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? value : '[]';
      } catch (e) {
        return '[]';
      }
    }
    return '[]';
  }

  /**
   * Hash password before saving
   * @param model Model instance
   * @param field Password field name
   */
  static async hashPassword(model: Model, field: string = 'password'): Promise<void> {
    if (model.changed(field) && model.get(field)) {
      const hashedPassword = await hash(model.get(field) as string, 10);
      model.set(field, hashedPassword);
    }
  }

  /**
   * Get common model options
   * @param tableName Table name
   * @param modelName Model name
   * @returns Common model options
   */
  static getCommonModelOptions(tableName: string, modelName: string) {
    return {
      sequelize: null, // To be set during initialization
      tableName,
      modelName,
      timestamps: true,
      paranoid: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    };
  }

  /**
   * Get common user model options
   * @returns Common user model options
   */
  static getUserModelOptions() {
    return {
      ...this.getCommonModelOptions('users', 'User'),
      defaultScope: {
        attributes: {
          exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires']
        }
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] }
        },
        withTokens: {
          attributes: {
            include: ['verificationToken', 'resetPasswordToken', 'resetPasswordExpires']
          }
        }
      }
    };
  }
} 