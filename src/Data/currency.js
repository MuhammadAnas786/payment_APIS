import mongoose from 'mongoose';

const { Schema } = mongoose;

const CurrencySchema = new Schema(
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
    countryName: {
      type: String
    },
    countrySymbol: {
      type: String
    }
  },
  { timestamps: true }
);

export const CurrencyModel = mongoose.model('currency', CurrencySchema);
