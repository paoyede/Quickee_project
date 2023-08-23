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
  router.post("/ForgotPassword", (req: Request, res: Response) =>
    forgotPassword(producer, req, res)
  );
  router.put("/UpdatePassword", updatePassword);
  router.post("/SaveOrders", authtoken, saveOrders);

  return router;
};

export default studentRoute;
