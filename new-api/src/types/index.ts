export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchRequest {
  id: string;
  userId: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
  result: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrawlResult {
  title: string;
  description: string | null;
  url: string;
} 