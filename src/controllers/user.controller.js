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
            role: role || "1", // Default role is "1" (user)
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

const createUserProfile = asyncHandler(async (req, res) => {
    try {
        const { email, firstName, lastName, gender, address, phoneNumber } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json(new ApiError(400, null, "Email is required"));
        }

        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User with this email not found"));
        }

        // Check if profile already exists
        if (user.firstName && user.lastName && user.gender && user.address && user.phoneNumber) {
            return res.status(400).json(new ApiError(400, null, "Profile already created"));
        }

        // Update user profile fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.gender = gender || user.gender;
        user.address = address || user.address;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        // Save updated user profile
        await user.save();

        // Send response
        res.status(201).json(new ApiResponse(201, user, "userInfo", "Profile created successfully"));
    } catch (error) {
        console.error("Error in createUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
   
    if (!req.user) {
        return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
    }

    // Fetch user details
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken "
    );

    if (!user) {
        return res.status(404).json(new ApiError(404, null, "User not found"));
    }

    // Return user details
    return res.status(200).json({
        status: true,
        statusCode: 200,
        message: "User fetched successfully",
        user: user, 
    });
});

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, gender, address, phoneNumber } = req.body;
        
        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Find the user by ID
        let user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User not found"));
        }

        // Update only allowed fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.gender = gender || user.gender;
        user.address = address || user.address;
        user.phoneNumber = phoneNumber || user.phoneNumber;

      
        // Save updated user profile
        await user.save();

        return res.status(200).json(new ApiResponse(200, user, "userInfo", "Profile updated successfully"));
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, 
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, {}, "User logged Out"));
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Find the user and set deletedFlag = 1
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { deletedFlag: 1 },
            { new: true }
        );

        if (!user) {
            return res.status(404).json(new ApiError(404, null, "User not found"));
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(200, {}, {}, "User marked as deleted successfully"));
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});




export {
    registerUser,
    loginUser,
    createUserProfile,
   getCurrentUser,
   updateUserProfile,
   logoutUser,
   deleteUser
};
