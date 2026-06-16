import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerValidator, loginValidator } from "../validators/user.validators.js";
import { validate } from "../validators/validate.js";

const router = Router();

// Routes for user authentication
router.route("/register").post(registerValidator(), validate, registerUser);
router.route("/login").post(loginValidator(), validate, loginUser);
router.route("/logout").get(verifyJWT, logoutUser);

export default router;
