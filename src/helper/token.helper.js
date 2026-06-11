import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '30d';

export const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

export const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateTokens = (userId, email) => {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);

  return {
    accessToken,
    refreshToken,
  };
};
