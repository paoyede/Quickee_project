import { NextFunction, Request, Response } from "express";
import Producer from "../Services/Implementations/MessageBroker/Producer";

// producerMiddleware.js

// Extend the Request type with the producer property
declare module "express" {
  interface Request {
    producer: Producer;
  }
}

export const producerMiddleware =
  (producer: Producer) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.producer = producer;
      next();
    } catch (error) {
      console.error("Error attaching Producer instance", error);
      next(error);
    }
  };
