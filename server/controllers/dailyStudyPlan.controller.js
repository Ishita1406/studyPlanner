// Imports
import DailyStudyPlan from "../models/dailyStudyPlan.model.js";
import Topic from "../models/topics.model.js";
import { generateFullSchedule } from "../utils/scheduler.js";

export const getTodayPlan = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];

    let plan = await DailyStudyPlan.findOne({
      user: userId,
      date: today,
    }).populate("tasks.topic", "name subject");

    let warning = null;

    // 🧠 Auto-generate FULL SCHEDULE if missing
    if (!plan) {
      const result = await generateFullSchedule(userId, today);
      if (!result.plan) {
        return res.status(404).json({ message: "No plan available" });
      }
      plan = result.plan;
      if (result.insufficientTime) {
        warning = "Not enough time to complete all topics before exams.";
      }
      if (result.missingExamSubjects && result.missingExamSubjects.length > 0) {
        const subjects = result.missingExamSubjects.join(", ");
        const msg = `Missing exam dates for: ${subjects}. Please update setup.`;
        warning = warning ? warning + "\n" + msg : msg;
      }
    }

    return res.status(200).json({ plan, warning });
  } catch (error) {
    console.error("Get today plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeTask = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { topicId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];
    const plan = await DailyStudyPlan.findOne({ user: userId, date: today });

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Remove the task
    plan.tasks = plan.tasks.filter(t => t.topic.toString() !== topicId);
    await plan.save();

    // Mark topic as skipped for today
    await Topic.findByIdAndUpdate(topicId, { lastSkippedDate: new Date() });

    return res.status(200).json({ message: "Task removed", plan });
  } catch (error) {
    console.error("Remove task error:", error);
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
    const { skip } = req.body;

    // Determine start date for generation
    let startDate = today;
    if (skip) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      startDate = d.toISOString().split("T")[0];
    }

    // REPEAT: Delete handled inside generateFullSchedule now? 
    // Actually scheduler.js deletes future plans. 
    // WE MUST DELETE TODAY MANUALLY IF SKIPPING
    if (skip) {
      await DailyStudyPlan.deleteOne({ user: userId, date: today });
    }

    // 🔁 Generate FULL schedule
    const result = await generateFullSchedule(userId, startDate);

    if (!result.plan) {
      return res.status(200).json({
        message: "No pending topics to schedule.",
        plan: null,
      });
    }

    // Construct warning
    let warning = result.insufficientTime ? "Not enough time to complete all topics before exams." : null;
    if (result.missingExamSubjects && result.missingExamSubjects.length > 0) {
      const subjects = result.missingExamSubjects.join(", ");
      const msg = `Missing exam dates for: ${subjects}. Please update setup.`;
      warning = warning ? warning + "\n" + msg : msg;
    }

    return res.status(200).json({
      message: "Study plan regenerated successfully",
      plan: result.plan,
      warning
    });
  } catch (error) {
    console.error("Regenerate plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getDatesWithPlans = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const plans = await DailyStudyPlan.find(
      { user: userId },
      { date: 1, _id: 0 }
    );

    const dates = plans.map(p => p.date);

    return res.status(200).json({ dates });
  } catch (error) {
    console.error("Get dates with plans error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


