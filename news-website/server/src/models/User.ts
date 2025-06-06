import { DataTypes, Model, Sequelize, Optional } from 'sequelize';
// @ts-ignore
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import ApiError from '@/utils/ApiError';
import { IUser, JWTPayload } from '@/types';

// Attributes for User creation (optional fields)
interface UserCreationAttributes extends Optional<IUser, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'user' | 'publisher' | 'admin';
  public isVerified!: boolean;
  public status!: 'active' | 'inactive' | 'suspended';
  public avatar?: string;
  public bio?: string;
  public lastLogin?: Date;
  public resetPasswordToken?: string;
  public resetPasswordExpire?: Date;
  public verifyEmailToken?: string;
  public verifyEmailExpire?: Date;
  public loginAttempts!: number;
  public lockUntil?: Date;
  public preferences!: Record<string, any>;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  // Phương thức tạo JWT token
  public getSignedJwtToken(): string {
    const payload: JWTPayload = { 
      id: this.id, 
      role: this.role,
      email: this.email
    };
    
    // @ts-ignore
    return jwt.sign(
      payload,
      process.env['JWT_SECRET']!,
      { expiresIn: process.env['JWT_EXPIRE'] || '30d' }
    );
  }

  // Phương thức so sánh mật khẩu
  public async matchPassword(enteredPassword: string): Promise<boolean> {
    if (!enteredPassword) {
      throw new ApiError(400, 'Please provide a password');
    }
    
    if (!this.password) {
      throw new ApiError(400, 'No password set for this user');
    }
    
    return await bcrypt.compare(enteredPassword, this.password);
  }

  // Check if user changed password after the token was issued
  public changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.updatedAt) {
      const changedTimestamp = Math.floor(this.updatedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
  }

  // Phương thức tạo token đặt lại mật khẩu
  public getResetPasswordToken(): string {
    // Tạo token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Mã hóa token và lưu vào database
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Đặt thời gian hết hạn (10 phút)
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }

  // Phương thức tạo token xác thực email
  public getVerifyEmailToken(): string {
    // Tạo token
    const verifyToken = crypto.randomBytes(20).toString('hex');

    // Mã hóa token và lưu vào database
    this.verifyEmailToken = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    // Đặt thời gian hết hạn (24 giờ)
    this.verifyEmailExpire = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    return verifyToken;
  }

  // Định nghĩa các mối quan hệ
  public static associate(models: any): void {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'articles'
    });
  }
}

// Hàm khởi tạo model
const initModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: 'Vui lòng nhập tên người dùng' },
          notEmpty: { msg: 'Tên không được để trống' },
          len: {
            args: [3, 50],
            msg: 'Tên người dùng phải có từ 3 đến 50 ký tự'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'email_unique',
        validate: {
          notNull: { msg: 'Vui lòng nhập email' },
          notEmpty: { msg: 'Email không được để trống' },
          isEmail: { msg: 'Vui lòng nhập email hợp lệ' }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'Vui lòng nhập mật khẩu' },
          notEmpty: { msg: 'Mật khẩu không được để trống' },
          len: {
            args: [6, 100],
            msg: 'Mật khẩu phải có từ 6 đến 100 ký tự'
          }
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'publisher', 'admin'),
        defaultValue: 'user'
      },
      avatar: {
        type: DataTypes.STRING,
        defaultValue: '/images/default-avatar.jpg'
      },
      bio: {
        type: DataTypes.STRING(500),
        validate: {
          len: {
            args: [0, 500],
            msg: 'Tiểu sử không được vượt quá 500 ký tự'
          }
        }
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      resetPasswordToken: DataTypes.STRING,
      resetPasswordExpire: DataTypes.DATE,
      verifyEmailToken: DataTypes.STRING,
      verifyEmailExpire: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      loginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      lockUntil: {
        type: DataTypes.DATE,
        allowNull: true
      },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {}
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'verifyEmailToken', 'verifyEmailExpire'] },
        where: { status: 'active' }
      },
      scopes: {
        withSensitiveData: {
          attributes: { include: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'verifyEmailToken', 'verifyEmailExpire'] }
        },
        withInactive: {
          where: { status: ['active', 'inactive'] }
        },
        withAll: {
          where: {}
        }
      },
      hooks: {
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed('password')) {
            const salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(user.password, salt);
          }
        }
      }
    }
  );

  return User;
};

// Export model
const init = (sequelize: Sequelize) => {
  return initModel(sequelize);
};

export { User, init as initModel };
