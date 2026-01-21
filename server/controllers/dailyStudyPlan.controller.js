import DailyStudyPlan from "../models/dailyStudyPlan.model.js";
import { generateDailyPlan } from "../utils/scheduler.js";

export const getTodayPlan = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];

    let plan = await DailyStudyPlan.findOne({
      user: userId,
      date: today,
    }).populate("tasks.topic", "name subject");

    // 🧠 Auto-generate if missing
    if (!plan) {
      const newPlan = await generateDailyPlan(userId);
      if (!newPlan) {
        return res.status(404).json({ message: "No plan available" });
      }

      plan = await DailyStudyPlan
        .findById(newPlan._id)
        .populate("tasks.topic", "name subject");
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("Get today plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getPlanByDate = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { date } = req.query;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!date) return res.status(400).json({ message: "Date is required" });

    const plan = await DailyStudyPlan.findOne({
      user: userId,
      date,
    }).populate("tasks.topic", "name subject");

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("Get plan by date error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const regeneratePlan = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];

    // 🔥 DELETE TODAY'S PLAN
    await DailyStudyPlan.deleteOne({
      user: userId,
      date: today,
    });

    // 🔁 Generate fresh plan
    const plan = await generateDailyPlan(userId);

    if (!plan) {
      return res.status(200).json({
        message: "No pending topics to schedule.",
        plan: null,
      });
    }

    const populatedPlan = await DailyStudyPlan
      .findById(plan._id)
      .populate("tasks.topic", "name subject");

    return res.status(200).json({
      message: "Study plan regenerated successfully",
      plan: populatedPlan,
    });
  } catch (error) {
    console.error("Regenerate plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

