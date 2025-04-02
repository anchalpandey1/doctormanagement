import { Router } from "express";
import {
    bookAppointment,
    getDoctorSlots,
    cancelAppointment,
    getUserAppointments,
    getDoctorAppointments,
    addPatientInfo,
    createCompleteAppointment
} from "../controllers/appointment.controller.js";
import upload from "../utils/multer.js";
import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/book").post( bookAppointment);
router.route("/addinfo").post( addPatientInfo);
router.route("/createappointment").post( createCompleteAppointment);
router.route("/slots/:doctorId").get( getDoctorSlots);
router.route("/cancel/:id").put( cancelAppointment);
router.route("/user/:userId").get( getUserAppointments);
router.route("/doctor/:doctorId").get( getDoctorAppointments);
export default router;
