import mongoose from 'mongoose';

const { Schema } = mongoose;

const CoinSchema = new Schema(
  {
    name: {
      type: String
    },
    label: {
      type: String
    },
    symbol: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: false
    },
    BlockchainAddress: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const CoinModel = mongoose.model('coins', CoinSchema);
