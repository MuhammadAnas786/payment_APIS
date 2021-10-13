import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserProfileSchema = new Schema(
  {
    firstName: {
      type: String,
      // required: true,
      min: [3]
    },

    lastName: {
      type: String,

      // required: true,
      min: [3]
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'others'],
      default: 'male'
    },
    referralId: {
      type: String,
      unique: true
    },
    picture: {
      type: String,
      default: ''
    },
    nationality: {
      type: String,
      default: ''
    },
    country: {
      type: String,
      default: ''
      //   required: true,
    },
    city: {
      type: String,
      default: ''
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      unique: true,
      required: true
    },
    address: {
      type: String,
      default: ''
    },
    VerificationStatus: {
      type: String,
      enum: ['Unverified', 'Tier 1 verified'],
      default: 'Unverified'
    },
    lastlogin: {
      type: Date,
      default: 0
    },
    IpCreated: {
      type: String,
      default: '0.0.0.0'
    },
    LastIp: {
      type: String,
      default: '0.0.0.0'
    }
  },
  { timestamps: true }
);

export const UserProfileModel = mongoose.model(
  'user-profile',
  UserProfileSchema
);
