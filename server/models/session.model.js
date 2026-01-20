import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        topic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
            required: true,
        },
        durationMinutes: {
            type: Number,
            required: true,
        },
        difficultyRating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        focusRating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
