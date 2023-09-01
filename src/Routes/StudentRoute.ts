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
  router.post("/SaveQuickOrders", authtoken, saveQuickOrders);
  router.put("/UpdateQuickOrders", updateQuickOrders);
  router.get("/GetQuickOrdersByUserEmail", getQuickOrdersByUserId);
  router.get("/GetOrdersByUserEmail", getOrdersByUserEmail);
  router.delete("/DeleteQuickOrders", deleteQuickOrders);

  return router;
};

export default studentRoute;
