import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      // required: true,

      min: 5
    },

    email: {
      type: String,
      unique: true,
      required: true
    },
    phoneNo: {
      type: String,
      default: ''
      // required: true,
    },

    reference: {
      type: String
    },

    password: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      enum: ['admin', 'user'],
      default: 'user'
    },

    isActive: {
      type: Boolean,
      default: false
    },

    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user-profile'
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('users', UserSchema);
