import express from "express"
import { registerUser,resetPasswordEmail,login } from "../controllers/userController.js";
export const authRoutes = express.Router();

 authRoutes.post('/signup', registerUser);
 authRoutes.put('/resetPassword', resetPasswordEmail);
 authRoutes.post('/login', login);