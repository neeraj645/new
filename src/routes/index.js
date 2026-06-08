import signupRoute from "./auth.route.js";

import express from "express";

const router = express.Router();
router.use("/auth", signupRoute);
export default router;