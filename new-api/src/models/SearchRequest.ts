import mongoose, { Document, Schema } from 'mongoose';

export interface ISearchRequest extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

const searchRequestSchema = new Schema<ISearchRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    result: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

export const SearchRequest = mongoose.model<ISearchRequest>('SearchRequest', searchRequestSchema); 