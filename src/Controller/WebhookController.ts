import { Request, Response } from "express";
import crypto from "crypto";
import { paystacksecret } from "../Utilities/Configs";
import { Message } from "../Response/IResponse";
import { InternalError } from "../Response/Responses";
import { AddToDB, FirstOrDefault, Update } from "../Infrastructure/Repository";
import { IPaymentDto, ITransferDBDto, ITransferDto } from "../Models/IKitchen";
import { transferToKitchen } from "../Services/Implementations/PayStack";
import { RandGenTrxRef } from "../Utilities/RandomNumber";

const aOrds = "AllUsersOrders";
const trxRef = "TrxRef";
const pTab = "Payments";
const rec = "Recipients";
const kId = "KitchenId";
const ktab = "Kitchen";
const trTab = "Transfers";
const trRef = "Reference";
const currentTime = new Date();

export const verifyWebhook = async (req: Request, res: Response) => {
  try {
    // Validate event
    const hash = crypto
      .createHmac("sha512", paystacksecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash === req.headers["x-paystack-signature"]) {
      // Retrieve the request's body
      const event = req.body;
      // Do something with event
      const data = event.data;
      if (event.event === "charge.success") {
        const reference = data.reference;
        var fetchOrder = await FirstOrDefault(aOrds, trxRef, reference);
        await Update(aOrds, trxRef, reference, {
          ...fetchOrder,
          IsPaid: true,
          UpdatedAt: currentTime,
        });

        const payment: IPaymentDto = {
          KitchenId: fetchOrder.KitchenId,
          UserId: fetchOrder.UserId,
          OrderId: fetchOrder.OrderId,
          TrxRef: fetchOrder.TrxRef,
          IsSuccess: true,
          Amount: fetchOrder.TotalAmount,
        };

        await AddToDB(pTab, payment);
        var fetchRecipient = await FirstOrDefault(
          rec,
          kId,
          fetchOrder.KitchenId
        );
        var kitchen = await FirstOrDefault(ktab, "Id", fetchOrder.KitchenId);
        const ref = await RandGenTrxRef(16, trTab, trRef);
        const transfer: ITransferDto = {
          source: "balance",
          amount: fetchOrder.TotalAmount,
          reference: ref,
          recipient: fetchRecipient.RecipientCode,
          reason: `Transfer order money to ${kitchen.KitchenName} kitchen`,
        };
        await transferToKitchen(transfer);

        const transferdb: ITransferDBDto = {
          KitchenId: fetchOrder.KitchenId,
          RecipientCode: fetchRecipient.RecipientCode,
          Reference: ref,
          Status: "pending",
        };
        await AddToDB(trTab, transferdb);
      } else if (event.event === "transfer.success") {
        var ref = data.reference;
        var trfCode = data.transfer_code;
        const payload = { Status: "successful", TransferCode: trfCode };
        var transfer = await FirstOrDefault(trTab, trRef, ref);
        var kitchen = await FirstOrDefault(ktab, "Id", transfer.KitchenId);
        await Update(trTab, trRef, ref, payload);
        console.log(
          `Order money has been sent to ${kitchen.KitchenName} kitchen`
        );
      } else {
        console.log("Check: ", data);
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};
