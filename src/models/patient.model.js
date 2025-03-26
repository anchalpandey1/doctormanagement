import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

const patientSchema = new Schema(
    {
        userid: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        firstName: {
            type: String,
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
        phoneNumber: {
            type: String,

            match: [/^\+?[1-9]\d{9,14}$/, "Please enter a valid phone number"],
            unique: true,
            trim: true
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],

        }
        ,
        address: {
            type: String,
        },
        profileUrl: {
            type: String,
        },

    },

    {
        timestamps: true,
    }
);



export const Patient = mongoose.model("Patient", patientSchema);
