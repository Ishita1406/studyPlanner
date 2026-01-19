import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        message: "Name, email, and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: true,
        message: "Password must be at least 8 characters long",
      });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.json({ 
            error: true,
            message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      error: false,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: "Email and password are required",
      });
    }

    const userInfo = await User.findOne({ email })

    if (!userInfo) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcryptjs.compare(password, userInfo.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: "Invalid email or password",
      });
    }

    userInfo.lastLoginAt = new Date();
    await userInfo.save();

    const accessToken = jwt.sign(
      { sub: userInfo._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      error: false,
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

export const getUser = async (req, res) => {
    try {
        const userId = req.user?.sub;
        if (!userId) {
            return res.status(400).json({message: "Unauthorized access!"});
        }

        const isUser = await User.findById(userId);
        if (!isUser) {
            return res.status(404).json({message: "User not found!"});
        }

        return res.json({
            user: isUser,
            message: "User fetched successfully"
        })
    } catch (error) {
        console.error("Error in getUser:", error);
        return res.status(500).json({message: "Internal server error"});
    }
}
