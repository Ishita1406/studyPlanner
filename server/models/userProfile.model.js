import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    timeZone: {
      type: String,
      default: "UTC",
    },
    preferredStudyWindow: {
      startHour: {
        type: Number,
        min: 0,
        max: 23,
      },
      endHour: {
        type: Number,
        min: 0,
        max: 23,
      },
    },
    energyProfile: [
      {
        hour: {
          type: Number,
          min: 0,
          max: 23,
          required: true,
        },
        energy: {
          type: Number,
          min: 0,
          max: 100,
          required: true,
        },
      },
    ],
    maxDailyMinutes: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);
export default UserProfile;
