import { signin, signup } from "../Controller/StudentController";
import { Router } from "express";

const router: Router = Router();

router.post("/SignUp", signup);
router.get("/signin", signin);

export default router;
