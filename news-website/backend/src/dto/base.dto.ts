import { IsNumber, IsOptional, IsString, Min, Transform } from 'class-validator';

// Base query parameters for pagination
export class BaseQueryParams {
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}

// Base pagination response
export class PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(
    data: T[],
    pagination: { total: number; page: number; limit: number }
  ) {
    this.success = true;
    this.data = data;
    this.pagination = {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    };
  }
}

// Base response with common fields
export class BaseResponseDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: { id: number; createdAt: Date; updatedAt: Date }) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

// Base create/update DTO with common fields
export class BaseCreateUpdateDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  status?: string;
} 