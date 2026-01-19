import Topic from "../models/topics.model.js";

export const createTopic = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const topic = new Topic({
      user: userId,
      subject: req.body.subjectId,
      name: req.body.name,
      estimatedMinutes: req.body.estimatedMinutes,
      difficultyScore: req.body.difficultyScore,
      learningVelocity: req.body.learningVelocity,
    });

    await topic.save();

    return res.status(201).json({
      message: "Topic created successfully",
      topic,
    });
  } catch (error) {
    console.error("Create topic error:", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Topic already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getTopics = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const filter = { user: userId };
    if (req.query.subjectId) {
      filter.subject = req.query.subjectId;
    }

    const topics = await Topic.find(filter)
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ topics });
  } catch (error) {
    console.error("Get topics error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateTopic = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { topicId } = req.params;

    const updatedTopic = await Topic.findOneAndUpdate(
      { _id: topicId, user: userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTopic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({
      message: "Topic updated successfully",
      topic: updatedTopic,
    });
  } catch (error) {
    console.error("Update topic error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteTopic = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { topicId } = req.params;

    const deleted = await Topic.findOneAndDelete({
      _id: topicId,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Topic not found" });
    }

    return res.status(200).json({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Delete topic error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
