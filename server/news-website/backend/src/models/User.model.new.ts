import { Model, DataTypes, Optional } from 'sequelize';
import { compare, hash } from 'bcryptjs';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  role: UserRole;
  imageUrl?: string | null;
  lastLogin?: Date | null;
  status: UserStatus;
  bio?: string | null;
  website?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type UserCreationAttributes = Omit<
  UserAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isVerified' | 'status' | 'role'
> & {
  isVerified?: boolean;
  status?: UserStatus;
  role?: UserRole;
};

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isVerified!: boolean;
  public verificationToken?: string | null;
  public resetPasswordToken?: string | null;
  public resetPasswordExpires?: Date | null;
  public role!: UserRole;
  public imageUrl?: string | null;
  public lastLogin?: Date | null;
  public status!: UserStatus;
  public bio?: string | null;
  public website?: string | null;
  public location?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return compare(candidatePassword, this.password);
  }

  public toJSON(): Omit<UserAttributes, 'password' | 'verificationToken' | 'resetPasswordToken' | 'resetPasswordExpires'> {
    const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...userWithoutSensitiveData } = this.get();
    return userWithoutSensitiveData as Omit<UserAttributes, 'password' | 'verificationToken' | 'resetPasswordToken' | 'resetPasswordExpires'>;
  }

  // Static methods
  public static initialize(sequelize: any): typeof User {
    if (User.initialized) return User;

    User.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            len: [2, 100],
            notEmpty: true
          }
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            notEmpty: true
          }
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [8, 100],
            notEmpty: true
          }
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        verificationToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordToken: {
          type: DataTypes.STRING,
          allowNull: true
        },
        resetPasswordExpires: {
          type: DataTypes.DATE,
          allowNull: true
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          allowNull: false,
          defaultValue: UserRole.USER
        },
        status: {
          type: DataTypes.ENUM(...Object.values(UserStatus)),
          allowNull: false,
          defaultValue: UserStatus.ACTIVE
        },
        imageUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
          validate: {
            isUrl: true
          }
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
          validate: {
            len: [0, 1000]
          }
        },
        website: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isUrl: true
          }
        },
        location: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'created_at',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: 'updated_at',
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'deleted_at',
        },
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User',
        timestamps: true,
        paranoid: true,
        underscored: true,
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
      }
    );

    // Hash password before saving
    User.beforeSave(async (user: User) => {
      if (user.changed('password') && user.password) {
        user.password = await hash(user.password, 10);
      }
    });

    User.initialized = true;
    return User;
  }

  // Associations
  public static associate(models: any): void {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'articles',
      onDelete: 'CASCADE'
    });
  }

  // Track initialization
  private static initialized: boolean = false;
}

export default User;