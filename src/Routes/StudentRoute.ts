import Producer from "../Services/Implementations/MessageBroker/Producer";
import {
  forgotPassword,
  saveOrders,
  signin,
  signup,
  updatePassword,
  verifyEmail,
} from "../Controller/StudentController";
import { Request, Response, Router } from "express";
import { producerMiddleware } from "../Middleware/RabbitMQProducer";

const studentRoute = (producer: Producer) => {
  const router: Router = Router();
  router.use(producerMiddleware(producer)); // Use the middleware for all routes in this router

  router.post("/SignUp", (req: Request, res: Response) =>
    signup(producer, req, res)
  ); // Pass the producer instance
  // router.post("/SignUp", signup);
  router.get("/SignIn", signin);
  router.put("/VerifyEmail", verifyEmail);
  router.post("/ForgotPassword", (req: Request, res: Response) =>
    forgotPassword(producer, req, res)
  );
  router.put("/UpdatePassword", updatePassword);
  router.post("/SaveOrders", saveOrders);

  return router;
};

export default studentRoute;
