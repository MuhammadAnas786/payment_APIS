import mongoose from 'mongoose';

const { Schema } = mongoose;

const AirtelSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    TxId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transactions',
      required: true
    }
  },
  { timestamps: true }
);

export const AirtelModel = mongoose.model('airtel', AirtelSchema);
