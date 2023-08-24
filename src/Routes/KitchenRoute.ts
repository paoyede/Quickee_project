import { authtoken } from "./../Middleware/TokenAuth";
import {
  createFoodMenu,
  createKitchen,
  deleteFoodMenu,
  deleteKitchen,
  forgotPassword,
  getKitchenMenusById,
  resetPassword,
  signin,
  updateFoodMenu,
  updateKitchen,
  verifyEmail,
} from "../Controller/KitchenController";
import { Request, Response, Router } from "express";
import Producer from "../Services/Implementations/MessageBroker/Producer";
import { producerMiddleware } from "../Middleware/RabbitMQProducer";

const kitchenRoute = (producer: Producer) => {
  const router: Router = Router();
  router.use(producerMiddleware(producer)); // Use the middleware for all routes in this router

  router.post("/Create", (req: Request, res: Response) =>
    createKitchen(producer, req, res)
  );
  router.post("/SignIn", signin);
  router.put("/VerifyEmail", verifyEmail);
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

  return router;
};

export default kitchenRoute;
