import express from "express";
const router = express.Router();

import {signupUser, verifyEmailUser, resendOtpUser, loginUser, logoutUser} from "../controllers/auth.controller.js";
import {signupSchema, verifyEmailSchema, resendOtpSchema, loginSchema} from "../validator/auth.validator.js";
import validate from "../middlewares/zod.js";
import auth from "../middlewares/authenticate.js";

router.post("/signup", validate(signupSchema), signupUser);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailUser);
router.post("/resend-otp", validate(resendOtpSchema), resendOtpUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", auth(), logoutUser);

export default router;