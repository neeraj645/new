import crypto from "crypto";

const generateOTP = (length = 6) => {
  if (length < 4 || length > 10)
    throw new Error("OTP length must be between 4 and 10");
  const min = 10 ** (length - 1);
  const max = (10 ** length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

const hashOTP = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const verifyOTP = (inputOTP, storedHash) => {
  const inputHash = hashOTP(inputOTP);
  return inputHash === storedHash;
};

export { generateOTP, hashOTP, verifyOTP };