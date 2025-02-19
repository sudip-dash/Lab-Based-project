import { Router } from "express";
import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  sendPasswordResetLink,
} from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadFile } from "../controller/upload.controller.js";

const router = Router();

router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);

router.route("/forgot-password").post(sendPasswordResetLink);
router.route("/reset-password/:resetToken").post(resetPassword);
router.route("/change-password").post(verifyJwt, changePassword);

router.route("/upload").post( upload.single("file"), uploadFile);

export default router;
