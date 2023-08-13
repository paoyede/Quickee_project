import {
  createFoodMenu,
  createKitchen,
  deleteKitchen,
  signin,
  updateKitchen,
} from "../Controller/KitchenController";
import { Router } from "express";

const router: Router = Router();

router.post("/Create", createKitchen);
router.get("/SignIn", signin);
router.put("/Update", updateKitchen);
router.delete("/Delete", deleteKitchen);
router.post("/CreateMenu", createFoodMenu);

export default router;
