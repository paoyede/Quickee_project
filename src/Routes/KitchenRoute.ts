import { authtoken } from "./../Middleware/TokenAuth";
import {
  addKitchenStaff,
  createFoodMenu,
  createKitchen,
  deleteFoodMenu,
  deleteKitchen,
  deleteKitchenStaff,
  forgotPassword,
  getKitchenMenusById,
  getKitchenOrdersByEmail,
  getNGBanks,
  resendVerifyEmail,
  resetPassword,
  signin,
  updateFoodMenu,
  updateKitchen,
  updateKitchenStaff,
  validateKitchenBank,
  verifyEmail,
} from "../Controller/KitchenController";
import { Request, Response, Router } from "express";
import Producer from "../Services/Implementations/MessageBroker/Producer";
import { producerMiddleware } from "../Middleware/RabbitMQProducer";
import { verifyWebhook } from "../Controller/WebhookController";

const kitchenRoute = (producer: Producer) => {
  const router: Router = Router();
  router.use(producerMiddleware(producer)); // Use the middleware for all routes in this router

  router.post("/Create", (req: Request, res: Response) =>
    createKitchen(producer, req, res)
  );
  router.post("/SignIn", signin);
  router.post("/AddStaff", (req: Request, res: Response) =>
    addKitchenStaff(producer, req, res)
  );
  router.delete("/DeleteStaff", deleteKitchenStaff);
  router.put("/UpdateStaff", updateKitchenStaff);
  router.put("/VerifyEmail", verifyEmail);
  router.get("/ResendVerifyEmail", (req: Request, res: Response) =>
    resendVerifyEmail(producer, req, res)
  );
  router.post("/ForgotPassword", (req: Request, res: Response) =>
    forgotPassword(producer, req, res)
  );
  router.put("/ResetPassword", resetPassword);
  router.put("/Update", authtoken, updateKitchen);
  router.delete("/Delete", deleteKitchen);
  router.post("/CreateMenu", authtoken, createFoodMenu);
  router.put("/UpdateMenu", authtoken, updateFoodMenu);
  router.delete("/DeleteMenu", authtoken, deleteFoodMenu);
  router.get("/GetKitchenMenus", authtoken, getKitchenMenusById);
  router.get("/GetKitchenOrders", authtoken, getKitchenOrdersByEmail);
  router.get("/GetBanks", authtoken, getNGBanks);
  router.get("/ValidateKitchenBank", validateKitchenBank);
  router.post("/VerifyWebhook", verifyWebhook);

  return router;
};

export default kitchenRoute;
