import mongoose from "mongoose"

const subjectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    examDate: {
        type: Date,
    },
    importanceLevel: {
        type: Number,
    },
}, { timestamps: true });

subjectSchema.index({ user: 1, name: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;