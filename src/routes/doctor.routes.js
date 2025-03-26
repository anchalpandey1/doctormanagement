import { Router } from "express";
import { createprofile } from "../controllers/doctor.controller.js";
import upload from "../utils/multer.js";
import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

//Admin Related
// router.route("/signup").post(upload.single("profile"), registerUser);
router.route("/createprofile").post(verifyJWT, createprofile);
export default router;
