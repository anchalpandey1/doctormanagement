import mongoose, { Schema } from "mongoose";
const doctorSchema = new Schema(
    {
        userid: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fullName: {
            type: String,
            trim: true,
            required:true,
        },
        qualification:{
            type:String,
            trim:true,
            required:true,
        },
        specialty:{
            type:String,
            trim:true,
            required:true,
        },
        bio:{
            type:String,
            trim:true,
            required:true,
        },
        languages:{
            type:String,
            trim:true,
            required:true,
        },
        hospital:{
            type:String,
            trim:true,
            required:true,
        },
        typesOfSurgeon:{
            type:String,
            trim:true,
            required:true,
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
        profileUrl: {
            type: String,
        },
        deletedFlag: {
            type: Number,
            default: 0, // 0: Active, 1: Deleted
        },
        email: {
            type: String, // Adding email field
            required: true,
            trim: true,
            lowercase: true
        },
    },
    
    {
        timestamps: true,
    }
);



export const Doctor = mongoose.model("Doctor", doctorSchema);
