import Subject from "../models/subject.model.js";

export const createSubject = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subject = new Subject({
      user: userId,
      name: req.body.name,
      examDate: req.body.examDate,
      importanceLevel: req.body.importanceLevel,
    });

    await subject.save();

    return res.status(201).json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Create subject error:", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Subject already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const subjects = await Subject
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({ subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getSubjectById = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const subject = await Subject.findOne({ _id: id, user: userId });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json({ subject });
  } catch (error) {
    console.error("Get subject by ID error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateSubject = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
    });
  } catch (error) {
    console.error("Update subject error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteSubject = async (req, res) => {
  try {
    const userId = req.user?.sub;
    const { id } = req.params;

    const deleted = await Subject.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    return res.status(200).json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Delete subject error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
