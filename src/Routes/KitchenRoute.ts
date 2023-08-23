import { authtoken } from "./../Middleware/TokenAuth";
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
router.put("/Update", authtoken, updateKitchen);
router.delete("/Delete", deleteKitchen);
router.post("/CreateMenu", authtoken, createFoodMenu);
router.put("/UpdateMenu", authtoken, updateFoodMenu);
router.delete("/DeleteMenu", authtoken, deleteFoodMenu);
router.get("/GetKitchenMenus", authtoken, getKitchenMenusById);

export default router;
