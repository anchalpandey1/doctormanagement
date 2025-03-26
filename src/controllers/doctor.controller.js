import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import path from "path";
import { compressAndSaveImage } from "../utils/imgCompress.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const createprofile = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const existingDoctor = await Doctor.findOne({ phoneNumber: req.body.phoneNumber });
        if (existingDoctor) {
            return res.status(400).json({ message: "Doctor profile already exists with this phone number." });
        }
        const newDoctor = new Doctor({
            fullName: req.body.fullName,
            qualification: req.body.qualification,
            specialty: req.body.specialty,
            bio: req.body.bio,
            languages: req.body.languages,
            hospital: req.body.hospital,
            typesOfSurgeon: req.body.typesOfSurgeon,
            phoneNumber: req.body.phoneNumber,
            gender: req.body.gender,
            profileUrl: req.body.profileUrl,
            email: userEmail, 
        });

        await newDoctor.save();

        res.status(201).json({ message: "Doctor profile created successfully", doctor: newDoctor });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};



export {
    createprofile
};
