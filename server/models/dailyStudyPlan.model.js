import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    plannedMinutes: {
      type: Number,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    energyMatchScore: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    completedMinutes: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isRevision: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const dailyStudyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    tasks: [taskSchema],
    totalPlannedMinutes: {
      type: Number,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

dailyStudyPlanSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyStudyPlan = mongoose.model(
  "DailyStudyPlan",
  dailyStudyPlanSchema
);

export default DailyStudyPlan;
