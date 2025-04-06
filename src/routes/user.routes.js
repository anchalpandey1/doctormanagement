import { Router } from "express";
import {
    registerUser,
    loginUser,
    createUserProfile,
    getCurrentUser,
    updateUserProfile,
    logoutUser,
    deleteUser
   
} from "../controllers/user.controller.js";

import { validateRequestBody } from "../middlewares/validation.middleware.js";

const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";

//Admin Related
// router.route("/signup").post(upload.single("profile"), registerUser);
router.route("/signup").post( registerUser);
router.route("/signin").post(loginUser);
router.route("/getcurrent").get(verifyJWT,getCurrentUser);
router.route("/logout").post( logoutUser);
export default router;
