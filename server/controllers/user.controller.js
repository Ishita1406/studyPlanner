import UserProfile from "../models/userProfile.model.js";

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

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};