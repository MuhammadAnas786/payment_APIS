import mongoose from 'mongoose';

const { Schema } = mongoose;

const MpesaSchema = new Schema(
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

export const MpesaModel = mongoose.model('mpesa', MpesaSchema);
