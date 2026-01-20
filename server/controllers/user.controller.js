import UserProfile from "../models/userProfile.model.js";
import Subject from "../models/subject.model.js";
import Topic from "../models/topics.model.js";
import { generateDailyPlan } from "../utils/scheduler.js";

const handleSubjects = async (userId, subjects) => {
  if (!subjects || !Array.isArray(subjects)) return;

  for (const subj of subjects) {
    // Find or Create Subject
    let subjectDoc = await Subject.findOne({ user: userId, name: subj.name });
    if (!subjectDoc) {
      subjectDoc = await Subject.create({
        user: userId,
        name: subj.name,
        // In future, frontend can pass examDate/importance here
      });
    }

    // Handle Topics
    if (subj.topics && Array.isArray(subj.topics)) {
      for (const topicName of subj.topics) {
        // Check if topic exists
        const existingTopic = await Topic.findOne({
          user: userId,
          subject: subjectDoc._id,
          name: topicName
        });

        if (!existingTopic) {
          await Topic.create({
            user: userId,
            subject: subjectDoc._id,
            name: topicName,
            estimatedMinutes: 30, // Default duration
            difficultyScore: 0.5, // Default difficulty
          });
        }
      }
    }
  }
};

export const createUserProfile = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const existingProfile = await UserProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(409).json({ message: "Profile already exists" });
    }

    const profile = new UserProfile({
      user: userId,
      ...req.body
    });

    await profile.save();

    if (req.body.subjects) {
      await handleSubjects(userId, req.body.subjects);
    }

    // Auto-generate plan for the first time
    await generateDailyPlan(userId);

    return res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  }
  catch (error) {
    console.error("Create profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const profile = await UserProfile
      .findOne({ user: userId })
      .populate("user", "name email");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (req.body.subjects) {
      await handleSubjects(userId, req.body.subjects);
    }

    // Regenerate plan to reflect changes
    await generateDailyPlan(userId);

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};