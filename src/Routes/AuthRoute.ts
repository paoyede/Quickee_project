import { signin, signup } from "../Controller/AuthController";
import { Router } from "express";

const router: Router = Router();

router.get("/signup", signup);
router.get("/signin", signin);

export default router;
