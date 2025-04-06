import { Router } from "express";
import { createUserProfile,getCurrentUser ,updateUserProfile ,deleteUser , logoutUser} from "../controllers/patient.controller.js";
// import upload from "../utils/multer.js";
import { validateRequestBody } from "../middlewares/validation.middleware.js";
import { upload } from "../utils/multer.js";
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";


router.route("/createprofile").post(verifyJWT,upload.single('profileUrl'), createUserProfile);
router.route("/getUser").get(verifyJWT,getCurrentUser);
router.route("/updateprofile").put(verifyJWT,updateUserProfile);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/delete").delete(verifyJWT, deleteUser);
export default router;
