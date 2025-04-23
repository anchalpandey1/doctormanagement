import { Router } from "express";
import {
    bookAppointment,
    getDoctorSlots,
    cancelAppointment,
    getUserAppointments,
    getDoctorAppointments,
    addPatientInfo,
    updateAppointment,
    createCompleteAppointment
} from "../controllers/appointment.controller.js";

import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/book").post( bookAppointment);
router.route("/addinfo").post( addPatientInfo);
router.route("/createappointment").post( createCompleteAppointment);
router.route("/slots/:doctorId").get(verifyJWT, getDoctorSlots);
router.route("/cancel/:id").put( verifyJWT,cancelAppointment);
router.route("/user/:userId").get(verifyJWT, getUserAppointments);
router.route("/doctor/:doctorId").get( verifyJWT,getDoctorAppointments);
router.route("/appointment/:id").patch( verifyJWT,updateAppointment);
export default router;
