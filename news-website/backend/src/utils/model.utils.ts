import { Model, DataTypes } from 'sequelize';
import { hash } from 'bcryptjs';

export class ModelUtils {
  /**
   * Parse JSON field from database
   * @param value Raw value from database
   * @returns Parsed array or empty array if invalid
   */
  public parseJsonArray(value: unknown): any[] {
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
   * Stringify array for database storage
   * @param value Array to stringify
   * @returns Stringified array or empty array string if invalid
   */
  public stringifyJsonArray(value: unknown): string {
    if (!value) return '[]';
    try {
      return Array.isArray(value) ? JSON.stringify(value) : '[]';
    } catch (e) {
      return '[]';
    }
  }

  /**
   * Get common model options
   * @param tableName Table name
   * @param modelName Model name
   * @returns Model options
   */
  public getCommonModelOptions(tableName: string, modelName: string) {
    return {
      tableName,
      modelName,
      timestamps: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['deletedAt'] },
      },
    };
  }

  /**
   * Hash password before saving
   * @param model Model instance
   * @param field Password field name
   */
  public async hashPassword(model: Model, field: string = 'password'): Promise<void> {
    if (model.changed(field) && model.get(field)) {
      const hashedPassword = await hash(model.get(field) as string, 10);
      model.set(field, hashedPassword);
    }
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

export default new ModelUtils(); 