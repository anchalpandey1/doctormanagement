import mongoose, { Schema } from "mongoose";

const appointmentSchema = new Schema(
    {
        doctorId: {
            type: Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        appointmentDate: {
            type: String, // Storing only date (YYYY-MM-DD)
            required: true,
            trim: true,
        },
        appointmentTime: {
            type: String, // Storing only time (HH:MM AM/PM)
            required: true,
            trim: true,
        },
        reason: {
            type: String,
            trim: true,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Upcoming", "Completed", "Cancelled"],
            default: "Pending"
        },

        firstname: {
            type: String,
            required: false,
        },
        lastname: {
            type: String,
            required: false,
        },
        gender: {
            type: String,
            required: false,
        },
        age: {
            type: Number,
            required: false,
        },
        problem: {
            type: String,
            required: false,
        },
        pkgname: {
            type: String,
            required: false,
        },
        pkgprice: {
            type: Number,
            required: false,
        },
        paymentMode: {
            type: String,
            enum: ["Card", "UPI"],
            required: true,
        },
        cardDetails: {
            cardNo: {
                type: String,
                // default: "44395946695",
            },
            cardExpDate: {
                type: String,
                // default: "12/28",
            },
            cvv: {
                type: String,
                // default: "244",
            },
        },
        upiId: {
            type: String,
            // default: "anchal@oksbi",
        },
    },
    {
        timestamps: true,
    }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
