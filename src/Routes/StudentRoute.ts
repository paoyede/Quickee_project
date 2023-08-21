import {
  forgotPassword,
  saveOrders,
  signin,
  signup,
  updatePassword,
} from "../Controller/StudentController";
import { Router } from "express";

const router: Router = Router();

router.post("/SignUp", signup);
router.get("/SignIn", signin);
router.post("/ForgotPassword", forgotPassword);
router.put("/UpdatePassword", updatePassword);
router.post("/SaveOrders", saveOrders);

export default router;
