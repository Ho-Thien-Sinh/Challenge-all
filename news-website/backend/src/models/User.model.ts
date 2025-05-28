import { Model, DataTypes, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ModelStatic } from 'sequelize';
import { compare, hash } from 'bcryptjs';

// Define enums first
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// Define the model attributes and types
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
  role: UserRole;
  status: UserStatus;
  imageUrl: string | null;
  lastLogin: Date | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Define the creation attributes (optional fields for creation)
export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isVerified' | 'role' | 'status'> {
  id?: number;
  isVerified?: boolean;
  role?: UserRole;
  status?: UserStatus;
}

// Define the model class with proper typing
export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string;
  declare isVerified: boolean;
  declare verificationToken: string | null;
  declare resetPasswordToken: string | null;
  declare resetPasswordExpires: Date | null;
  declare role: UserRole;
  declare status: UserStatus;
  declare imageUrl: string | null;
  declare lastLogin: Date | null;
  declare bio: string | null;
  declare website: string | null;
  declare location: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: Date | null;

  // Instance methods
  public async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.password);
  }

  public toJSON() {
    const values = { ...this.get() } as any;
    
    // Remove sensitive data
    delete values.password;
    delete values.verificationToken;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpires;
    
    return values;
  }

  // Static methods
  public static initialize(sequelize: Sequelize): typeof User {
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
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        verificationToken: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        resetPasswordToken: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        resetPasswordExpires: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          defaultValue: UserRole.USER,
        },
        status: {
          type: DataTypes.ENUM(...Object.values(UserStatus)),
          defaultValue: UserStatus.ACTIVE,
        },
        imageUrl: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        website: {
          type: DataTypes.STRING(255),
          allowNull: true,
          validate: {
            isUrl: true,
          },
        },
        location: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
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
          },
        },
        scopes: {
          withSensitiveData: {
            attributes: { 
              include: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
            },
          },
          withPassword: {
            attributes: { include: ['password'] },
          },
          withTokens: {
            attributes: { 
              include: ['verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
            },
          },
        },
        hooks: {
          beforeCreate: async (user: User) => {
            if (user.password) {
              user.password = await hash(user.password, 10);
            }
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password') && user.password) {
              user.password = await hash(user.password, 10);
            }
          },
        },
      }
    );

    // Hash password before saving
    User.beforeSave(async (user: User) => {
      if (user.changed('password') && user.password) {
        user.password = await hash(user.password, 10);
      }
    });

    return User;
  }

  // Associations
  public static associate(models: { Article: ModelStatic<Model> }): void {
    User.hasMany(models.Article, {
      foreignKey: 'authorId',
      as: 'articles',
      onDelete: 'CASCADE',
    });
  }
}

export default User;
