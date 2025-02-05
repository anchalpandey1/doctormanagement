import mongoose, { Schema } from "mongoose";
import validator from "validator";

const userProfileSchema = new Schema(
    {
        userid: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        phoneNo: {
            type: String,
            required: [true, "Phone number is required"],
            validate: {
                validator: (value) => validator.isMobilePhone(value, "any"),
                message: "Please enter a valid phone number",
            },
        },
        profileUrl: {
            type: String,
            validate: {
                validator: (value) => validator.isURL(value),
                message: "Invalid URL",
            },
        },
        gender: {
            type: String,
            enum: ["male", "female"],
        },
        address: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);
