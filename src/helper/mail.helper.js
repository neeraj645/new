import transporter from "../config/nodemailer.config.js";
const appName = process.env.APP_NAME || "YourApp";


const otpMail = async (email, purpose, name, otp) => {
  try {
    const emailTypes = {
      signup: "Welcome! Verify Your Email",
      login: "Your Login OTP",
      resetPassword: "Reset Password OTP",
    }[purpose] || "Your OTP Code";

    const subject = {
      signup: "Welcome to " + appName + " - Verify Your Email",
      login: "Your Login OTP for " + appName,
      resetPassword: "Reset Your " + appName + " Password",
    }[purpose] || "Your OTP Code from " + appName;

    const htmlTemplate = `
      <div style="max-width: 500px; margin: auto; padding: 20px; 
          background: #ffffff; border-radius: 10px; 
          font-family: Arial, sans-serif; border: 1px solid #eee;">

        <div style="text-align: center;">
          <img src="https://cdn-icons-png.flaticon.com/512/709/709790.png" 
               width="80" style="margin-bottom: 10px;" />
          <h2 style="color: #333;">Hello, ${name} 👋</h2>
        </div>

        <p style="font-size: 15px; color: #555; line-height: 22px;">
          Use the OTP below to complete your <b>${purpose}</b> process.
          This OTP is valid for the next <b>10 minutes</b>.
        </p>

        <div style="
              margin: 25px auto;
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              padding: 15px 0;
              text-align: center;
              border-radius: 8px;
              color: #ffffff;
              font-size: 32px;
              letter-spacing: 6px;
              font-weight: bold;">
          ${otp}
        </div>

        <p style="font-size: 15px; color: #555;">
          If you didn’t request this, please ignore this email.
        </p>

        <div style="margin-top: 30px; padding-top: 15px; 
                border-top: 1px solid #eee; text-align: center;">
          <p style="font-size: 13px; color: #aaa;">
            © ${new Date().getFullYear()} ${appName} — All Rights Reserved
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${appName}" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html: htmlTemplate,
    });

    // console.log("Mail info:", info);

    return { status: true, message: "OTP email sent successfully" };

  } catch (error) {
    console.error("OTP Email Error:", error);
    return { status: false, message: "Failed to send email" };
  }
}

export default { otpMail };