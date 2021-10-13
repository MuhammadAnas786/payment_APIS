import mongoose from 'mongoose';

const Float = require('mongoose-float').loadType(mongoose);

const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    Api: {
      type: mongoose.Schema.Types.ObjectId
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    Ordertype: {
      type: String,
      enum: ['c2b', 'b2c'],
      default: 'c2b'
      // required:true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId
    },
    servicecharges: {
      type: Float
    },
    tax: {
      type: Float
    },
    total: {
      type: Float,
      required: true
    },
    discount: {
      type: Float
    },
    apiName: {
      type: String,
      enum: ['MTN', 'M-PESA', 'AIRTEL'],
      required: true
    },
    paymentStatus: {
      type: String,
      required: true,
      default: 'processing',
      enum: [
        'open',
        'pending',
        'authorized',
        'paid',
        'canceled',
        'expired',
        'failed',
        'processing'
      ]
    },
    paymentId: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    },
    CustomerMSISDN: {
      type: String
    },
    ConversationID: {
      type: String
    },
    ResponseCode: {
      type: String
    },
    ResponseDesc: {
      type: String
    }
  },
  { timestamps: true }
);

export const TransactionModel = mongoose.model(
  'transactions',
  TransactionSchema
);
