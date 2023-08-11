import {
  forgotPassword,
  signin,
  signup,
} from "../Controller/StudentController";
import { Router } from "express";

const router: Router = Router();

router.post("/SignUp", signup);
router.get("/SignIn", signin);
router.post("/ForgotPassword", forgotPassword);

export default router;
