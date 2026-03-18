import { Request, Response } from "express";
import * as authService from "../services/auth.service";

// Cookie config — refresh token only, access token goes in response body
const COOKIE_OPTIONS = {
  httpOnly: true,                                       // JS can't access it — blocks XSS
  secure: process.env.NODE_ENV === "production",        // HTTPS only in prod
  sameSite: "strict" as const,                          // blocks CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000,                     // 7 days in ms
};

// ─────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.registerUser(
      name,
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, accessToken, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    // 409 for duplicate email, 400 for everything else
    const status = message === "Email already in use" ? 409 : 400;
    res.status(status).json({ success: false, message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.status(200).json({ success: true, accessToken, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed";
    res.status(401).json({ success: false, message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Token comes from cookie automatically — client doesn't manage it
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: "No refresh token" });
      return;
    }

    const { accessToken, refreshToken } = await authService.refreshTokens(token);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS); // rotate cookie too
    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Token refresh failed";
    // 403 = had a token but it's invalid/expired (vs 401 = no token at all)
    res.status(403).json({ success: false, message });
  }
};

// ─────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by authMiddleware (see below)
    await authService.logoutUser(req.user!.id);

    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// ─────────────────────────────────────────────
// GET /auth/me
// ─────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    res.status(404).json({ success: false, message });
  }
};