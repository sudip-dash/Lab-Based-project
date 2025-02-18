import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controller/user.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route('/signup').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt,logoutUser)

export default router