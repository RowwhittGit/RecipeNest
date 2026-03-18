import { Router } from "express";
import { register, login, refresh, logout, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/authenticate";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", protect, logout);
authRouter.get("/me", protect, getMe);

export default authRouter;
