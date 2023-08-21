import {
  makepaystack_payment,
  verifypaystack_payment,
} from "../Controller/PaymentController";
import { Router } from "express";

const router: Router = Router();
/* HTTP REQUEST */

router.post("/MakePayment", makepaystack_payment);
router.get("/VerifyPayment", verifypaystack_payment);

export default router;
