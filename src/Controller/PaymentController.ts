import { cryptoGenTrxRef } from "./../Utilities/RandomNumber";
import { Request, Response } from "express";
import { Message } from "../Response/IResponse";
import { IPayment } from "Models/PayStack";
import {
  paystackPayment,
  paystackVerifyPayment,
} from "../Services/Implementations/PayStack";
import { FirstOrDefault, Update } from "../Infrastructure/Repository";

const MAX_RETRIES = 3; // Maximum number of retries
let retryCount = 0;
const aOrds = "AllUsersOrders";
const trxRef = "TrxRef";
const pTab = "Payments";
const currentTime = new Date();
let saveOrderId: string;

export const makepaystack_payment = async (req: Request, res: Response) => {
  try {
    const payload: IPayment = req.body;
    const dbpar = "AllUsersOrders";
    const orderId = retryCount > 0 ? saveOrderId : payload.orderId;
    var fetchOrder = await FirstOrDefault(dbpar, "OrderId", orderId);
    if (fetchOrder == null) {
      const error = Message(400, "Order not found");
      return res.status(400).json(error);
    }
    const reference = fetchOrder.TrxRef;
    const newPayload = {
      ...payload,
      reference: reference,
      amount: parseInt(fetchOrder.TotalAmount) * 100,
    };

    delete payload.orderId; //await cryptoGenTrxRef(10, "Payments", "TrxRef");

    // console.log("payment payload: ", newPayload);
    paystackPayment(newPayload)
      .then((response: any) => {
        // console.log(response);

        return res
          .status(200)
          .json(Message(200, "Payment link received", response));
      })
      .catch(async (error: any) => {
        // console.error("check: ", error.response.data);
        const response = error.response.data;
        if (
          response.status === false &&
          response.message === "Duplicate Transaction Reference"
        ) {
          if (fetchOrder.IsPaid === false) {
            // Check if we've reached the maximum number of retries
            const update = {
              TrxRef: await cryptoGenTrxRef(7, aOrds, "TrxRef"),
              UpdatedAt: currentTime,
            };
            await Update(aOrds, trxRef, reference, update);
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              console.log(`Retrying payment, attempt ${retryCount}`);
              // Retry the payment after a short delay (e.g., 1 second)
              saveOrderId = fetchOrder.OrderId;
              setTimeout(() => makepaystack_payment(req, res), 1000);
            } else {
              return res.status(404).json("Maximum retries reached"); // Maximum retries reached
            }
          } else {
            const success = Message(200, "Payment already made");
            return res.status(404).json(success);
          }
        }
        // return res.status(404).json(error.response.data);
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
