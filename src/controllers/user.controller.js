import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import path from "path";
import { compressAndSaveImage } from "../utils/imgCompress.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

// User Registration
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { email, password, confirmPassword, role} = req.body;

        // Validate required fields
        if (!email || !password || !confirmPassword ) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Create new user
        const newUser = new User({
            
            email,
            password,
            role: role || "2", // Default role is "2" (user)
        });
        await newUser.save();

        // Generate access token
        const accessToken = jwt.sign(
            { _id: newUser._id, role: newUser.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: { _id: newUser._id,  email: newUser.email, role: newUser.role },
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});
//user Login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!password && !email) {
      return res
          .status(400)
          .json(new ApiError(400, null, "password or email is required"));
  }

  const user = await User.findOne({
      $or: [{ email }],
  });
  if (!user) {
      return res
          .status(404)
          .json(new ApiError(404, null, "User does not exist"));
  }
console.log(user);
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
      return res
          .status(401)
          .json(new ApiError(401, null, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
  );

  const loggedInUser = await User.findById(user._id).select(
      "-password   -refreshToken -createdAt -updatedAt -__v"
  );

  const options = {
      httpOnly: true,
      secure: true,
  };

  return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
          new ApiResponse(
              200,
              loggedInUser,
              "userInfo",
              "User logged In Successfully",
              accessToken,
              refreshToken
          )
      );
});

export {
    registerUser,
    loginUser
};
