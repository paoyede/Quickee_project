import Producer from "../Services/Implementations/MessageBroker/Producer";
import {
  getQuickOrdersByUserId,
  deleteQuickOrders,
  forgotPassword,
  resendVerifyEmail,
  resetPassword,
  saveOrders,
  saveQuickOrders,
  signin,
  signup,
  updateQuickOrders,
  verifyEmail,
  getOrdersByUserEmail,
  fundWallet,
  chargeWallet,
  registerDeviceToken,
  writeReview,
  updateReview,
  deleteReview,
} from "../Controller/StudentController";
import { Request, Response, Router } from "express";
import { producerMiddleware } from "../Middleware/RabbitMQProducer";
import { authtoken } from "../Middleware/TokenAuth";

const studentRoute = (producer: Producer) => {
  const router: Router = Router();
  router.use(producerMiddleware(producer)); // Use the middleware for all routes in this router

  router.post("/SignUp", (req: Request, res: Response) =>
    signup(producer, req, res)
  ); // Pass the producer instance
  // router.post("/SignUp", signup);
  router.post("/SignIn", signin);
  router.put("/VerifyEmail", verifyEmail);
  router.get("/ResendVerifyEmail", (req: Request, res: Response) =>
    resendVerifyEmail(producer, req, res)
  );
  router.post("/ForgotPassword", (req: Request, res: Response) =>
    forgotPassword(producer, req, res)
  );
  router.put("/ResetPassword", resetPassword);
  router.post("/SaveOrders", authtoken, saveOrders);
  router.get("/GetOrdersByUserEmail", authtoken, getOrdersByUserEmail);
  router.post("/SaveQuickOrders", authtoken, saveQuickOrders);
  router.get("/GetQuickOrdersByUserEmail", authtoken, getQuickOrdersByUserId);
  router.put("/UpdateQuickOrders", authtoken, updateQuickOrders);
  router.delete("/DeleteQuickOrders", authtoken, deleteQuickOrders);
  router.post("/FundWallet", authtoken, fundWallet);
  router.post("/ChargeWallet", authtoken, chargeWallet);
  router.post("/RegisterDeviceToken", registerDeviceToken);
  router.post("/WriteReview", authtoken, writeReview);
  router.put("/UpdateReview", authtoken, updateReview);
  router.delete("/DeleteReviewById", authtoken, deleteReview);

  return router;
};

export default studentRoute;
