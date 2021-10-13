import mongoose from 'mongoose';

const Float = require('mongoose-float').loadType(mongoose);

const { Schema } = mongoose;

const c2bSchema = new Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transactions'
    },
    coin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'coins',
      required: true
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'currency',
      required: true
    },

    orderNo: {
      type: String,
      default: null,
      unique: true
    },

    orderStatus: {
      type: String,
      required: true,
      default: 'pending',
      enum: [
        'open',
        'pending',
        'authorized',
        'delivered',
        'canceled',
        'failed',
        'processing'
      ]
    },
    isDelivered: {
      type: Boolean,
      default: false
    },
    userCoinAddress: {
      type: String
    },
    totalDeliverable: {
      type: Number
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const c2bModel = mongoose.model('c2b', c2bSchema);
