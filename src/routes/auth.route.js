import express from "express";
const router = express.Router();

import {signupUser} from "../controllers/auth.controller.js";
import {signupSchema} from "../validator/auth.validator.js";
import validate from "../middlewares/zod.js";

router.post("/signup", validate(signupSchema), signupUser);

export default router;