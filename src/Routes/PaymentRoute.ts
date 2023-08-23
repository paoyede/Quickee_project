import { authtoken } from "./../Middleware/TokenAuth";
import {
  makepaystack_payment,
  verifypaystack_payment,
} from "../Controller/PaymentController";
import { Router } from "express";

const router: Router = Router();
/* HTTP REQUEST */

router.post("/MakePayment", authtoken, makepaystack_payment);
router.get("/VerifyPayment", authtoken, verifypaystack_payment);

export default router;
