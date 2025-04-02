import { Appointment } from "../models/appointment.model.js";
import { Doctor } from "../models/doctor.model.js";
import { User } from "../models/user.model.js";
import moment from "moment";

// **1. Book an Appointment**
export const bookAppointment = async (req, res) => {
    try {
        let { doctorId, userId, appointmentDate, appointmentTime, reason } = req.body;

        // ✅ Convert time to 24-hour format
        appointmentTime = moment(appointmentTime, ["h:mm A"]).format("HH:mm");

        // ✅ Check if Doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        // ✅ Check if User exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Check if Slot is Available
        const existingAppointment = await Appointment.findOne({ doctorId, appointmentDate, appointmentTime });
        if (existingAppointment) {
            return res.status(400).json({ success: false, message: "Slot is already booked" });
        }

        // ✅ Create Appointment
        const appointment = new Appointment({
            doctorId,
            userId,
            appointmentDate,
            appointmentTime,
            reason,
            status: "Pending"
        });

        // await appointment.save();
        res.status(201).json({ success: true, message: "Appointment booked successfully", appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const addPatientInfo = async (req, res) => {
    try {
        let { appointment, firstname, lastname, gender, age, problem, pkgname, pkgprice } = req.body;

        if (!appointment) {
            return res.status(400).json({ success: false, message: "Appointment data is required" });
        }

        // ✅ Merge Additional Patient Information
        const updatedAppointment = {
            ...appointment,  // Previous appointment data
            firstname,
            lastname,
            gender,
            age,
            problem,
            pkgname,
            pkgprice
        };

        res.status(200).json({ success: true, message: "Complete appointment data preview", updatedAppointment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
export const createCompleteAppointment = async (req, res) => {
    try {
        const { appointment, paymentMode } = req.body;

        if (!appointment) {
            return res.status(400).json({ success: false, message: "Appointment data is required" });
        }

        // ✅ Initialize payment details
        let paymentDetails = { paymentMode };

        if (paymentMode === "Card") {
            paymentDetails.cardDetails = {
                cardNo: "44395946695",
                cardExpDate: "12/28",
                cvv: "244"
            };
            paymentDetails.upiId = undefined; // ❌ Ensure `upiId` is NOT stored
        } else if (paymentMode === "UPI") {
            paymentDetails.upiId = "anchal@oksbi";
            paymentDetails.cardDetails = undefined; // ❌ Ensure `cardDetails` is NOT stored
        } else {
            return res.status(400).json({ success: false, message: "Invalid payment mode" });
        }

        // ✅ Merge appointment data with payment details
        const newAppointment = new Appointment({
            ...appointment,
            ...paymentDetails
        });

        // ✅ Save the new appointment
        await newAppointment.save();

        res.status(201).json({
            success: true,
            message: "Appointment created successfully with payment details",
            appointment: newAppointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
// **2. Get Available Slots for a Doctor**
export const getDoctorSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // ✅ Find doctor and get available slots
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.status(200).json({
            success: true,
            message: "Available slots fetched successfully",
            doctor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// **3. Cancel an Appointment**
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        appointment.status = "Cancelled";
        await appointment.save();
        res.status(200).json({ success: true, message: "Appointment cancelled successfully", appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// **4. Get User's Appointments**
export const getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        const appointments = await Appointment.find({ userId })
            .populate("doctorId", "fullName specialty")
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        res.status(200).json({ success: true, message: "User's Appointments", appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// export const getDoctorAppointments = async (req, res) => {
//     try {
//         const { doctorId } = req.params;
//         const appointments = await Appointment.find({ doctorId })
//             .populate("userId", "fullName email")
//             .sort({ appointmentDate: 1, appointmentTime: 1 });

//         res.status(200).json({ success: true, message: "Doctor's Appointments", appointments });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };




export const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Convert doctorId to ObjectId to match MongoDB schema
        const objectIdDoctorId = new mongoose.Types.ObjectId(doctorId);

        // Fetch appointment statistics using aggregation
        const stats = await Appointment.aggregate([
            {
                $match: { doctorId: objectIdDoctorId }
            },
            {
                $group: {
                    _id: "$doctorId",
                    totalAppointments: { $sum: 1 },
                    pendingAppointments: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
                    upcomingAppointments: { $sum: { $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0] } },
                    cancelledAppointments: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } }
                }
            }
        ]);

        // Fetch all appointments for the doctor with user details
        const appointments = await Appointment.find({ doctorId: objectIdDoctorId })
            .populate("userId", "email")
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        // Transforming data to match expected response structure
        const formattedAppointments = appointments.map(appointment => ({
            cardDetails: {
                cardNo: appointment.cardDetails?.cardNo || "",
                cardExpDate: appointment.cardDetails?.cardExpDate || "",
                cvv: appointment.cardDetails?.cvv || ""
            },
            _id: appointment._id,
            doctorId: appointment.doctorId,
            userId: {
                _id: appointment.userId?._id,
                email: appointment.userId?.email
            },
            appointmentDate: appointment.appointmentDate,
            appointmentTime: appointment.appointmentTime,
            reason: appointment.reason,
            status: appointment.status,
            firstname: appointment.firstname,
            lastname: appointment.lastname,
            gender: appointment.gender,
            age: appointment.age,
            problem: appointment.problem,
            pkgname: appointment.pkgname,
            pkgprice: appointment.pkgprice,
            paymentMode: appointment.paymentMode,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt
        }));

        res.status(200).json({
            success: true,
            message: "Doctor's Appointments",
            totalAppointments: stats.length ? stats[0].totalAppointments : 0,
            pendingAppointments: stats.length ? stats[0].pendingAppointments : 0,
            upcomingAppointments: stats.length ? stats[0].upcomingAppointments : 0,
            cancelledAppointments: stats.length ? stats[0].cancelledAppointments : 0,
            appointments: formattedAppointments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



// export const getDoctorAppointments = async (req, res) => {
//     try {
//         const { doctorId } = req.params;

//         // Convert doctorId to ObjectId
//         const objectIdDoctorId = new mongoose.Types.ObjectId(doctorId);

//         const stats = await Appointment.aggregate([
//             {
//                 $match: { doctorId: objectIdDoctorId } // Ensure correct data type
//             },
//             {
//                 $group: {
//                     _id: "$doctorId",
//                     totalAppointments: { $sum: 1 },
//                     pendingAppointments: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } },
//                     upcomingAppointments: { $sum: { $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0] } },
//                     cancelledAppointments: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } }
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "doctors",
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "doctorDetails"
//                 }
//             },
//             {
//                 $unwind: {
//                     path: "$doctorDetails",
//                     preserveNullAndEmptyArrays: true // Ensures doctor details are still returned even if they don't exist
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     doctorId: "$_id",
//                     doctorName: "$doctorDetails.fullName",
//                     specialty: "$doctorDetails.specialty",
//                     totalAppointments: 1,
//                     pendingAppointments: 1,
//                     upcomingAppointments: 1,
//                     cancelledAppointments: 1
//                 }
//             }
//         ]);

//         res.status(200).json({
//             success: true,
//             message: "Doctor appointment statistics",
//             stats: stats.length ? stats : []
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };

