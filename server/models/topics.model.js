import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    estimatedMinutes: {
      type: Number,
      required: true,
    },
    difficultyScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    learningVelocity: {
      type: Number,
      default: 1,
    },
    masteryLevel: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },
    lastReviewedAt: {
      type: Date,
    },
    lastSkippedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

topicSchema.index({ user: 1, subject: 1, name: 1 }, { unique: true });

const Topic = mongoose.model("Topic", topicSchema);
export default Topic;
