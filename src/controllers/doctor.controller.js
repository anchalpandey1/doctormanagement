
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Doctor } from "../models/doctor.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import dotenv from "dotenv";

dotenv.config();

const createprofile = asyncHandler(async (req, res) => {
    const { fullName, qualification, specialty, bio, languages, hospital, typesOfSurgeon, phoneNumber, gender, profileUrl, experience } = req.body;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized access.");
    }

    const userid = req.user._id; // Get user ID from authentication

    // Check if doctor profile already exists with the given phone number or email
    const existingDoctor = await Doctor.findOne({ 
        $or: [{ phoneNumber }, { email: req.user.email }] 
    });

    if (existingDoctor) {
        throw new ApiError(400, "Doctor profile already exists with this phone number or email.");
    }

    const newDoctor = await Doctor.create({
        userid,
        fullName: fullName.trim(),
        qualification: qualification.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        languages: languages.trim(),
        hospital: hospital.trim(),
        typesOfSurgeon: typesOfSurgeon.trim(),
        phoneNumber: phoneNumber.trim(),
        gender,
        profileUrl,
        email: req.user.email,
        experience // Added experience field
    });

    res.status(201).json(new ApiResponse(201, newDoctor,"doctor", "Doctor profile created successfully"));
});

// const getDoctorProfile = asyncHandler(async (req, res) => {
//     if (!req.user) {
//         throw new ApiError(401, "Unauthorized access.");
//     }

//     const doctor = await Doctor.findOne({ userid: req.user._id });

//     if (!doctor) {
//         throw new ApiError(404, "Doctor profile not found.");
//     }

//     res.status(200).json(new ApiResponse(200, doctor,"doctor", "Doctor profile fetched successfully."));
// });

//here doctorprofile get by userid in params
const getDoctorProfile = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get user ID from request parameters

    if (!id) {
        throw new ApiError(400, "User ID is required.");
    }

   

    const doctor = await Doctor.findOne({ _id: id }); // Use _id instead of id

    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found.");
    }

    res.status(200).json(new ApiResponse(200, doctor, "doctor", "Doctor profile fetched successfully."));
});



const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await Doctor.find();

    if (!doctors.length) {
        throw new ApiError(404, "No doctors found.");
    }

    res.status(200).json(new ApiResponse(200, doctors, "doctor", "List of all doctors fetched successfully."));
});

const updateDoctorProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized access.");
    }

    const userid = req.user._id;
    const updatedData = { ...req.body };

    if (updatedData.phoneNumber) {
        const existingDoctor = await Doctor.findOne({ phoneNumber: updatedData.phoneNumber });
        if (existingDoctor && existingDoctor.userid.toString() !== userid.toString()) {
            throw new ApiError(400, "Phone number already in use.");
        }
    }

    const doctor = await Doctor.findOneAndUpdate({ userid }, updatedData, { new: true });

    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found.");
    }

    res.status(200).json(new ApiResponse(200, doctor,"doctor", "Doctor profile updated successfully."));
});

const deleteDoctorProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized access.");
    }

    const doctor = await Doctor.findOneAndDelete({ userid: req.user._id });

    if (!doctor) {
        throw new ApiError(404, "Doctor profile not found.");
    }

    res.status(200).json(new ApiResponse(200, null, "Doctor profile deleted successfully."));
});

export {
    createprofile,
    getDoctorProfile,
    getAllDoctors,
    updateDoctorProfile,
    deleteDoctorProfile
};
