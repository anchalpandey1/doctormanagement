import { Router } from "express";
import { createprofile,getDoctorProfile ,getAllDoctors,updateDoctorProfile ,deleteDoctorProfile} from "../controllers/doctor.controller.js";

import { validateRequestBody } from "../middlewares/validation.middleware.js";
import { upload } from "../utils/multer.js";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/createprofile").post(verifyJWT,upload.single('profileUrl'),createprofile);
router.route("/get/:id").get(verifyJWT, getDoctorProfile);
router.route("/getall").get( getAllDoctors);
router.route("/update").put(verifyJWT, updateDoctorProfile);
router.route("/delete").delete(verifyJWT, deleteDoctorProfile);
export default router;
