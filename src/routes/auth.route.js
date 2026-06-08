import express from "express";
const router = express.Router();

import {signupUser} from "../controllers/auth.controller.js";
import {registerSchema} from "../validator/auth.validator.js";
import validate from "../middlewares/zod.js";

router.post("/signup", validate(registerSchema), signupUser);

export default router;