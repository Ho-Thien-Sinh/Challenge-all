import { Service } from 'typedi';
import { Op } from 'sequelize';
import { User, UserAttributes, UserRole } from '../models/User.model';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ArticleResponse } from '../dto/user.dto';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import logger from '../utils/logger';
import { ServiceUtils } from '../utils/service.utils';

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
  ) {
    const where = {
      ...ServiceUtils.buildSearchConditions(search || '', ['name', 'email']),
      ...(role ? { role } : {})
    };

    try {
      const { count, rows } = await User.findAndCountAll({
        where,
        ...ServiceUtils.buildPaginationQuery({ page, limit }),
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] }
      });

      return ServiceUtils.formatPaginationResult(
        count,
        rows.map(user => new UserResponseDto(user.toJSON())),
        page,
        limit
      );
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get users');
    }
  }
  
  async getUserById(id: number): Promise<UserResponseDto> {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return new UserResponseDto(user.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get user');
    }
  }
  
  async updateUser(id: number, updateData: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await user.update(updateData as any);

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [{
          association: 'articles',
          attributes: ['id', 'title', 'status', 'publishedAt']
        }]
      });

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user');
      }

      return new UserResponseDto(updatedUser.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'update user');
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
        attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [{
          association: 'articles',
          attributes: ['id', 'title', 'status', 'publishedAt'],
          where: { status: 'published' },
          required: false
        }]
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      return new UserResponseDto(user.toJSON());
    } catch (error) {
      ServiceUtils.handleDatabaseError(error, 'get user profile');
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
