import mongoose from 'mongoose';

const searchAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromStationId: {
    type: String,
    required: true
  },
  toStationId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  cabinClass: {
    type: String,
    required: true
  },
  departureTimeRange: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  statusReason: {
    type: String,
    default: null
  },
  lastChecked: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

searchAlertSchema.index({ fromStationId: 1, toStationId: 1, date: 1 });

const SearchAlert = mongoose.model('SearchAlert', searchAlertSchema);

export default SearchAlert; 