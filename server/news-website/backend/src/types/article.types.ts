export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface ArticleQueryOptions {
  where?: any;
  include?: any[];
  order?: any[];
  limit?: number;
  offset?: number;
}
