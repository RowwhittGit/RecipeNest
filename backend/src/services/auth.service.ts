import bcrypt from "bcryptjs";
import { User, IUser } from "../models/User.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  // 1. Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  // 2. Create user — pre("save") hook hashes the password automatically
  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
  });

  // 3. Issue tokens
  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken(user._id.toString());

  // 4. Store hashed refresh token — never store plain tokens in DB
  const hashed = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashed;
  user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
  // 1. Find user — must explicitly select password (select: false in schema)
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive) throw new Error("Invalid credentials");

  // 2. Block OAuth users from logging in with password
  if (user.authProvider !== "local") {
    throw new Error(`Please sign in with ${user.authProvider}`);
  }

  // 3. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Invalid credentials");

  // 4. Issue tokens
  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken(user._id.toString());

  // 5. Rotate refresh token in DB
  const hashed = await bcrypt.hash(refreshToken, 10);
  user.refreshToken = hashed;
  user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// REFRESH
// ─────────────────────────────────────────────
export const refreshTokens = async (
  incomingToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  // 1. Verify JWT signature — throws if expired or tampered
  const payload = verifyRefreshToken(incomingToken);

  // 2. Find user with their stored refresh token
  const user = await User.findById(payload.id).select(
    "+refreshToken +refreshTokenExpiresAt"
  );
  if (!user || !user.refreshToken) throw new Error("Invalid refresh token");

  // 3. Check DB-level expiry (second line of defense beyond JWT expiry)
  if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt < new Date()) {
    user.refreshToken = null;
    user.refreshTokenExpiresAt = null;
    await user.save({ validateBeforeSave: false });
    throw new Error("Refresh token expired, please login again");
  }

  // 4. Compare incoming plain token against stored hash
  const isValid = await bcrypt.compare(incomingToken, user.refreshToken);
  if (!isValid) throw new Error("Invalid refresh token");

  // 5. Rotate — generate new pair, invalidate old token
  const newAccessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  const newRefreshToken = generateRefreshToken(user._id.toString());

  const hashed = await bcrypt.hash(newRefreshToken, 10);
  user.refreshToken = hashed;
  user.refreshTokenExpiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await user.save({ validateBeforeSave: false });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export const logoutUser = async (userId: string): Promise<void> => {
  // Null out refresh token — even if someone has the cookie, DB check kills it
  await User.findByIdAndUpdate(userId, {
    refreshToken: null,
    refreshTokenExpiresAt: null,
  });
};

// ─────────────────────────────────────────────
// GET ME
// ─────────────────────────────────────────────
export const getMe = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw new Error("User not found");
  return user;
};