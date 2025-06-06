// Type definitions for the application

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

export {};

declare global {
  // Global types
  interface Article {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    category: string;
    url: string;
    publishedAt: string;
    source: string;
    author: string;
    createdAt?: string;
  }

  interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
  }
}
