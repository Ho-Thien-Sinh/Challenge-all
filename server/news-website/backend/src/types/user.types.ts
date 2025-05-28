import { Model } from 'sequelize';
import { UserAttributes, UserRole } from '../models/User.model';

// Định nghĩa interface cho User instance
export interface IUser extends Model<UserAttributes>, UserAttributes {
  // Các phương thức instance của model
  getFullName(): string;
  // Thêm các phương thức khác nếu cần
}

// Định nghĩa type cho User model
export type UserModel = typeof Model & {
  new (): IUser;
  // Các phương thức static của model
  findByEmail(email: string): Promise<IUser | null>;
  // Thêm các phương thức static khác nếu cần
}
