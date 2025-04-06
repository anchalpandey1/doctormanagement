import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Patient } from "../models/patient.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import path from "path";
import { compressAndSaveImage } from "../utils/imgCompress.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// const createUserProfile = asyncHandler(async (req, res) => {
//     try {
//         const { firstName, lastName, gender, address, phoneNumber, profileUrl } = req.body;

//         if (!req.user) {
//             return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
//         }

//         // Check if patient profile already exists for this user
//         let patient = await Patient.findOne({ userid: req.user._id });

//         if (patient) {
//             return res.status(400).json(new ApiError(400, null, "Profile already created"));
//         }

//         // Create new patient profile
//         patient = new Patient({
//             userid: req.user._id,
//             firstName,
//             lastName,
//             gender,
//             address,
//             phoneNumber,
//             profileUrl,
//         });

//         await patient.save();

//         res.status(201).json(new ApiResponse(201, patient, "userInfo", "Profile created successfully"));
//     } catch (error) {
//         console.error("Error in createUserProfile:", error);
//         res.status(500).json(new ApiError(500, null, "Internal Server Error"));
//     }
// });

const createUserProfile = asyncHandler(async (req, res) => {
    try {
        const { firstName, lastName, gender, address, phoneNumber } = req.body;
        // if (!req.file) {
        //   return res.status(400).json({ message: 'No file uploaded' });
        // }
        console.log(req.file.filename);
        const profileUrl = req.file.filename; // Assuming the filename is stored in req.file.filename

        console.log(req.body);
        

        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Check if patient profile already exists for this user
        let patient = await Patient.findOne({ userid: req.user._id });

        if (patient) {
            return res.status(400).json(new ApiError(400, null, "Profile already created"));
        }

        // Create new patient profile
        patient = new Patient({
            userid: req.user._id,
            firstName,
            lastName,
            gender,
            address,
            phoneNumber,
            profileUrl,
        });

        await patient.save();

        res.status(201).json(new ApiResponse(201, patient, "userInfo", "Profile created successfully"));
    } catch (error) {
        console.error("Error in createUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Find patient profile using userid
        const patient = await Patient.findOne({ userid: req.user._id });

        if (!patient) {
            return res.status(404).json(new ApiError(404, null, "Profile not found"));
        }

        res.status(200).json(new ApiResponse(200, patient, "userInfo", "Profile retrieved successfully"));
    } catch (error) {
        console.error("Error in getCurrentUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Find the patient profile
        let patient = await Patient.findOne({ userid: req.user._id });

        if (!patient) {
            return res.status(404).json(new ApiError(404, null, "Profile not found"));
        }

        // Extract fields to update from req.body
        const { firstName, lastName, gender, address, phoneNumber, profileUrl } = req.body;

        // Update only provided fields
        if (firstName) patient.firstName = firstName;
        if (lastName) patient.lastName = lastName;
        if (gender) patient.gender = gender;
        if (address) patient.address = address;
        if (phoneNumber) patient.phoneNumber = phoneNumber;
        if (profileUrl) patient.profileUrl = profileUrl;

        // Save updated profile
        await patient.save();

        res.status(200).json(new ApiResponse(200, patient, "userInfo", "Profile updated successfully"));
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        // Optionally, add the token to a blacklist (if you're maintaining one)
        res.status(200).json(new ApiResponse(200, null, "Logout successful"));
    } catch (error) {
        console.error("Error in logoutUser:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, null, "Unauthorized access"));
        }

        // Find and delete the user profile
        const patient = await Patient.findOneAndDelete({ userid: req.user._id });

        if (!patient) {
            return res.status(404).json(new ApiError(404, null, "Profile not found"));
        }

        res.status(200).json(new ApiResponse(200, null, "userInfo", "Profile deleted successfully"));
    } catch (error) {
        console.error("Error in deleteUserProfile:", error);
        res.status(500).json(new ApiError(500, null, "Internal Server Error"));
    }
});






export {
    createUserProfile,
    getCurrentUser,
    updateUserProfile,
    logoutUser,
    deleteUser
};
