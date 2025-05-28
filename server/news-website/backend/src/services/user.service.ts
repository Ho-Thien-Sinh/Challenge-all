import { Service } from 'typedi';
import { Op } from 'sequelize';
import { User, UserAttributes, UserRole } from '../models/User.model';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ArticleResponse } from '../dto/user.dto';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import logger from '../utils/logger';

interface UserWithArticles extends UserAttributes {
  articles?: Array<ArticleResponse>;
}

@Service()
export class UserService {
  async getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    role?: UserRole
  ): Promise<{ 
    data: UserResponseDto[], 
    pagination: { 
      total: number; 
      page: number; 
      totalPages: number; 
      limit: number; 
    } 
  }> {
    const offset = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    
    return {
      data: rows.map((user: any) => new UserResponseDto(user.toJSON())),
      pagination: {
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
    };
  }
  
  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const userData = user.get({ plain: true }) as UserWithArticles;
    return this.mapToUserResponse(userData);
  }
  
  async updateUser(id: number, updateData: UpdateUserDto): Promise<UserResponseDto> {
    // Find the user by ID
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    try {
      // Update user data
      await user.update(updateData);
      
      // Fetch the updated user with all attributes (excluding sensitive data)
      const updatedUser = await User.findByPk(id, {
        attributes: { 
          exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
        },
        include: [
          {
            association: 'articles',
            attributes: ['id', 'title', 'status', 'publishedAt']
          }
        ]
      });
      
      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }
      
      // Convert to plain object and map to response DTO
      const updatedUserData = updatedUser.get({ plain: true }) as UserWithArticles;
      return this.mapToUserResponse(updatedUserData);
      
    } catch (error: unknown) {
      logger.error(`Error updating user ${id}:`, error);
      
      if (error instanceof Error) {
        if ('name' in error && error.name === 'SequelizeUniqueConstraintError') {
          throw new BadRequestException('Email already in use');
        } else if ('name' in error && error.name === 'SequelizeValidationError' && 'errors' in error) {
          const validationError = error as { errors: Array<{ message: string }> };
          const messages = validationError.errors.map(e => e.message);
          throw new BadRequestException(`Validation error: ${messages.join(', ')}`);
        }
      }
      
      throw new BadRequestException('Failed to update user');
    }
  }
  
  async deleteUser(id: number): Promise<void> {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      await user.destroy();
      logger.info(`User with ID ${id} has been deleted`);
      
    } catch (error: unknown) {
      logger.error(`Error deleting user ${id}:`, error);
      
      if (error instanceof Error) {
        // Handle specific database constraints if needed
        if ('name' in error && error.name === 'SequelizeForeignKeyConstraintError') {
          throw new BadRequestException('Cannot delete user with associated articles');
        }
      }
      
      throw new BadRequestException('Failed to delete user');
    }
  }
  
  async getUserProfile(id: number): Promise<UserResponseDto> {
    try {
      const user = await User.findByPk(id, {
        attributes: { 
          exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] 
        },
        include: [
          {
            association: 'articles',
            attributes: ['id', 'title', 'status', 'publishedAt'],
            where: { status: 'published' },
            required: false,
          },
        ],
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      const userData = user.get({ plain: true }) as UserWithArticles;
      return this.mapToUserResponse(userData);
      
    } catch (error: unknown) {
      logger.error(`Error fetching user profile ${id}:`, error);
      throw new BadRequestException('Failed to fetch user profile');
    }
  }
  
  private mapToUserResponse(userData: UserWithArticles): UserResponseDto {
    // Ensure required fields are present
    if (!userData.id || !userData.name || !userData.email || !userData.role) {
      throw new Error('Invalid user data: missing required fields');
    }

    return new UserResponseDto({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      isVerified: userData.isVerified || false,
      imageUrl: userData.imageUrl || null,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined,
      status: userData.status || undefined,
      bio: userData.bio || undefined,
      website: userData.website || undefined,
      location: userData.location || undefined,
      articles: userData.articles?.map(article => ({
        id: article.id,
        title: article.title,
        status: article.status,
        publishedAt: article.publishedAt
      })) || [],
      createdAt: userData.createdAt || new Date(),
      updatedAt: userData.updatedAt || new Date()
    });
  }
}
