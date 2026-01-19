import DailyStudyPlan from "../models/dailyStudyPlan.model.js";

export const getTodayPlan = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date().toISOString().split("T")[0];

    const plan = await DailyStudyPlan.findOne({
      user: userId,
      date: today,
    }).populate("tasks.topic", "name subject");

    if (!plan) {
      return res.status(404).json({ message: "No plan found for today" });
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
    // You should protect this with admin/system middleware (Do this later)
    const { userId, date, tasks } = req.body;

    if (!userId || !date || !tasks) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const totalPlannedMinutes = tasks.reduce(
      (sum, t) => sum + t.plannedMinutes,
      0
    );

    const plan = await DailyStudyPlan.findOneAndUpdate(
      { user: userId, date },
      {
        user: userId,
        date,
        tasks,
        totalPlannedMinutes,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "Study plan generated successfully",
      plan,
    });
  } catch (error) {
    console.error("Regenerate plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
