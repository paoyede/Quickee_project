import { cryptoGenTrxRef } from "./../Utilities/RandomNumber";
import { Request, Response } from "express";
import { Message } from "../Response/IResponse";
import { IPayment } from "Models/PayStack";
import {
  paystackPayment,
  paystackVerifyPayment,
} from "../Services/Implementations/PayStackPayment";
import { FirstOrDefault } from "../Infrastructure/Repository";

export const makepaystack_payment = async (req: Request, res: Response) => {
  try {
    const payload: IPayment = req.body;
    var getReference = await FirstOrDefault(
      "AllUsersOrders",
      "Id",
      payload.orderId
    );
    if (getReference == null) {
      const error = Message(400, "Order not found");
      res.status(400).json(error);
    }
    const newPayload = { ...payload, reference: getReference.TrxRef };

    delete payload.orderId; //await cryptoGenTrxRef(10, "Payments", "TrxRef");

    console.log("payment payload: ", newPayload);
    paystackPayment(newPayload)
      .then((response: any) => {
        // console.log(response);
        return res
          .status(200)
          .json(Message(200, "Payment link received", response));
      })
      .catch((error: any) => {
        console.error("check: ", error.response.data);
        return res.status(404).json(error.response.data);
      });
  } catch (error) {
    return res.status(404).json("Transaction not retrieved");
  }
};

export const verifypaystack_payment = async (req: Request, res: Response) => {
  try {
    const reference = req.query.Reference.toString();
    // const response = paystackverifypayment(reference);
    paystackVerifyPayment(reference)
      .then((response) => {
        return res.status(200).json(Message(200, "", response));
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    return res.status(404).json("Transaction not retrieved");
  }
};
