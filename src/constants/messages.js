// constants/messages.js

export const MESSAGES = {
  AUTH: {
    OTP_SENT: "OTP sent successfully",
    OTP_VERIFIED: "OTP verified successfully",
    LOGIN_SUCCESS: "Login successful",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP expired",
    OTP_ALREADY_SENT: "OTP already sent to your email, please wait 1 minute before requesting a new OTP",
    OTP_SEND_FAILED: "Failed to send OTP, please try again",
    EMAIL_VERIFIED: "Email verified successfully",
    EMAIL_NOT_VERIFIED: "Please verify your email before login",
    EMAIL_ALREADY_REGISTERED: "Email is already registered",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_INACTIVE: "Your account is inactive",
    LOGOUT_SUCCESS: "Logged out successfully",
  },

  USER: {
    CREATED: "User created successfully",
    UPDATED: "User updated successfully",
    DELETED: "User deleted successfully",
    NOT_FOUND: "User not found",
  },
  

  COMMON: {
    SUCCESS: "Success",
    INTERNAL_SERVER_ERROR: "Internal server error",
    SOMETHING_WENT_WRONG: "Something went wrong",
  },
};