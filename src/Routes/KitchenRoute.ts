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
  getReviews,
  kitchenImageUpload,
  notifyToAllUsers,
  resendVerifyEmail,
  resetPassword,
  sendNotification,
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
import fileUpload from "express-fileupload";
import { FileExtLimiter } from "../Middleware/FileExtLimiter";
import { FileSizeLimiter } from "../Middleware/FileSizeLimiter";
import { FilesPayloadExists } from "../Middleware/FilesPayloadExists";

const kitchenRoute = (producer: Producer) => {
  const router: Router = Router();
  router.use(producerMiddleware(producer)); // Use the middleware for all routes in this router

  router.post("/Create", (req: Request, res: Response) =>
    createKitchen(producer, req, res)
  );
  router.post("/SignIn", signin);
  router.post("/AddStaff", authtoken, (req: Request, res: Response) =>
    addKitchenStaff(producer, req, res)
  );
  router.delete("/DeleteStaff", authtoken, deleteKitchenStaff);
  router.put("/UpdateStaff", authtoken, updateKitchenStaff);
  router.put("/VerifyEmail", verifyEmail);
  router.get("/ResendVerifyEmail", (req: Request, res: Response) =>
    resendVerifyEmail(producer, req, res)
  );
  router.post("/ForgotPassword", (req: Request, res: Response) =>
    forgotPassword(producer, req, res)
  );
  router.put("/ResetPassword", resetPassword);
  router.put("/Update", authtoken, updateKitchen);
  router.delete("/Delete", authtoken, deleteKitchen);
  router.post("/CreateMenu", authtoken, createFoodMenu);
  router.put("/UpdateMenu", authtoken, updateFoodMenu);
  router.delete("/DeleteMenu", authtoken, deleteFoodMenu);
  router.get("/GetKitchenMenus", authtoken, getKitchenMenusById);
  router.get("/GetKitchenOrders", authtoken, getKitchenOrdersByEmail);
  router.get("/GetBanks", getNGBanks);
  router.get("/ValidateKitchenBank", validateKitchenBank);
  router.post("/VerifyWebhook", verifyWebhook);
  router.get("/GetReviewsByKitchenId", authtoken, getReviews);
  router.post("/SendNotification", authtoken, sendNotification);
  router.post("/NotifiyAllUsers", authtoken, notifyToAllUsers);
  router.post(
    "/Upload",
    fileUpload({ createParentPath: true }),
    FilesPayloadExists,
    FileExtLimiter([".png", ".jpg", ".jpeg"]),
    FileSizeLimiter,
    kitchenImageUpload
  );

  return router;
};

export default kitchenRoute;
