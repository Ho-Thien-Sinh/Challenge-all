import { Model, WhereOptions, Includeable, Order } from 'sequelize';

// Interface cơ bản cho các options query
export interface BaseQueryOptions {
  where?: WhereOptions;
  include?: Includeable[];
  order?: Order;
  limit?: number;
  offset?: number;
}

// Interface cơ bản cho các attributes của model
export interface BaseAttributes {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface cơ bản cho các instance của model
export interface BaseModelInstance<T extends BaseAttributes> extends Model<T>, T {
  // Các phương thức instance chung có thể được thêm vào đây
}

// Type cơ bản cho các model
export type BaseModel<T extends BaseAttributes, I extends BaseModelInstance<T>> = typeof Model & {
  new (): I;
  // Các phương thức static chung có thể được thêm vào đây
}

// Interface cho các response có phân trang
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface cho các response thành công
export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Interface cho các response lỗi
export interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
} 