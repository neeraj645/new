import { Worker } from "bullmq";
import redisConnection from "../config/ioredis.config.js";
import otpMail from "../helper/mail.helper.js";

console.log("Email worker started...");

new Worker(
    "emailQueue",
    async (job) => {
        console.log("Job received:", job.name, job.data);

        switch (job.name) {
            case "sendOtp":
                try {
                    console.log("Sending email...");

                    const result = await otpMail.otpMail(
                        job.data.email,
                        "signup",
                        job.data.name,
                        job.data.otp
                    );

                    console.log("Email sent:", result);
                } catch (error) {
                    console.error("Email error:", error);
                }
                break;

            default:
                console.log("Unknown job");
        }
    },
    {
        connection: redisConnection,
    }
);