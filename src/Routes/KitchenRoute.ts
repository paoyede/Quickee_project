import {
  createFoodMenu,
  createKitchen,
  deleteFoodMenu,
  deleteKitchen,
  getKitchenMenusById,
  signin,
  updateFoodMenu,
  updateKitchen,
} from "../Controller/KitchenController";
import { Router } from "express";

const router: Router = Router();

router.post("/Create", createKitchen);
router.get("/SignIn", signin);
router.put("/Update", updateKitchen);
router.delete("/Delete", deleteKitchen);
router.post("/CreateMenu", createFoodMenu);
router.put("/UpdateMenu", updateFoodMenu);
router.delete("/DeleteMenu", deleteFoodMenu);
router.get("/GetKitchenMenus", getKitchenMenusById);

export default router;
