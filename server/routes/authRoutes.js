import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getMe,
} from "../controllers/authController.js  ";
import { protect } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", protect, logoutUser);
authRouter.get("/me", protect, getMe);

export default authRouter;
