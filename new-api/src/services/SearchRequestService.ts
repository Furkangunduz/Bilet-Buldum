import { ISearchRequest, SearchRequest } from '../models/SearchRequest';

export class SearchRequestService {
  async create(data: {
    userId: string;
    url: string;
    status: 'pending' | 'completed' | 'failed';
  }): Promise<ISearchRequest> {
    const searchRequest = new SearchRequest(data);
    return await searchRequest.save();
  }

  async update(id: string, data: Partial<ISearchRequest>): Promise<ISearchRequest | null> {
    return await SearchRequest.findByIdAndUpdate(id, data, { new: true });
  }

  async findByUserId(userId: string): Promise<ISearchRequest[]> {
    return await SearchRequest.find({ userId }).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<ISearchRequest | null> {
    return await SearchRequest.findById(id);
  }
} 