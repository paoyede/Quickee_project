import { Request, Response } from "express";
import crypto from "crypto";
import { paystacksecret } from "../Utilities/Configs";
import { Message } from "../Response/IResponse";
import { InternalError } from "../Response/Responses";
import { AddToDB, FirstOrDefault, Update } from "../Infrastructure/Repository";
import { IPaymentDto, ITransferDBDto, ITransferDto } from "../Models/IKitchen";
import { transferToKitchen } from "../Services/Implementations/PayStack";
import { RandGenTrxRef } from "../Utilities/RandomNumber";
import { IDebit, IWallet } from "../Models/IStudent";

const aOrds = "AllUsersOrders";
const trxRef = "TrxRef";
const pTab = "Payments";
const rec = "Recipients";
const kId = "KitchenId";
const ktab = "Kitchen";
const trTab = "Transfers";
const trRef = "Reference";
const depTab = "Deposits";
const sTab = "Student";
const uid = "UserId";
const wTab = "Wallets";
const debTab = "Debits";
const currentTime = new Date();

let amount;

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
        const refLength = reference.length;
        if (refLength === 7) {
          var fetchOrder = await FirstOrDefault(aOrds, trxRef, reference);
          const kitId = fetchOrder.KitchenId;
          await Update(aOrds, trxRef, reference, {
            ...fetchOrder,
            IsPaid: true,
            UpdatedAt: currentTime,
          });

          const payment: IPaymentDto = {
            KitchenId: kitId,
            UserId: fetchOrder.UserId,
            OrderId: fetchOrder.OrderId,
            TrxRef: fetchOrder.TrxRef,
            IsSuccess: true,
            Amount: fetchOrder.TotalAmount,
          };

          await AddToDB(pTab, payment);
          var fetchRecipient = await FirstOrDefault(rec, kId, kitId);
          var kitchen = await FirstOrDefault(ktab, "Id", kitId);
          const ref = await RandGenTrxRef(16, trTab, trRef);

          const transfer: ITransferDto = {
            source: "balance",
            amount: fetchOrder.TotalAmount * 100,
            reference: ref,
            recipient: fetchRecipient.RecipientCode,
            reason: `Transfer order money to ${kitchen.KitchenName} kitchen`,
          };

          await transferToKitchen(transfer);

          const transferdb: ITransferDBDto = {
            KitchenId: kitId,
            OrderId: fetchOrder.OrderId,
            RecipientCode: fetchRecipient.RecipientCode,
            Reference: ref,
            Status: "pending",
          };

          await AddToDB(trTab, transferdb);
        } else if (refLength === 8) {
          var fetchDep = await FirstOrDefault(depTab, trxRef, reference);
          // console.log("data: ", event);
          // res.sendStatus(200);
          var ooid = fetchDep.UserId;
          await Update(depTab, trxRef, reference, {
            ...fetchDep,
            Status: "successful",
            UpdatedAt: currentTime,
          });

          var fetchUser = await FirstOrDefault(sTab, "Id", ooid);
          var fetchWallet = await FirstOrDefault(wTab, uid, ooid);

          if (fetchWallet != null) {
            var balance = parseInt(fetchWallet.Balance);

            await Update(wTab, uid, ooid, {
              ...fetchWallet,
              Balance: balance + parseInt(fetchDep.Amount),
              UpdatedAt: currentTime,
            });
          } else if (fetchWallet === null) {
            const wallet: IWallet = {
              Balance: fetchDep.Amount,
              UserId: ooid,
              FullName: `${fetchUser.LastName} ${fetchUser.FirstName}`,
            };
            await AddToDB(wTab, wallet);
          }
        }
      } else if (event.event === "transfer.success") {
        var ref = data.reference;
        const refLength = ref.length;

        var trfCode = data.transfer_code;
        const payload = { Status: "successful", TransferCode: trfCode };
        var transfer = await FirstOrDefault(trTab, trRef, ref);
        // console.log("first: ", transfer.Status);
        if (transfer.Status != "successful") {
          const kitchen = await FirstOrDefault(ktab, "Id", transfer.KitchenId);
          const dboid = "OrderId";
          const oid = transfer.OrderId;
          const fetchOrder = await FirstOrDefault(aOrds, dboid, oid);

          await Update(trTab, trRef, ref, payload);

          if (refLength === 17) {
            const amount = data.amount / 100;
            const debit: IDebit = {
              Amount: amount,
              KitchenId: kitchen.Id,
              OrderId: oid,
              Status: "successful",
              TrxRef: fetchOrder.TrxRef,
              UserId: fetchOrder.UserId,
            };
            const usId = fetchOrder.UserId;
            var fetchWallet = await FirstOrDefault(wTab, uid, usId);
            await Update(wTab, uid, usId, {
              Balance: fetchWallet.Balance - amount,
            });
            await Update(aOrds, trxRef, fetchOrder.TrxRef, {
              ...fetchOrder,
              IsPaid: true,
              UpdatedAt: currentTime,
            });

            await AddToDB(debTab, debit);
            // return res
            //   .status(500)
            //   .json(Message(200, "Wallet payment successful"));
          }

          console.log(
            `#${fetchOrder.TotalAmount} Order money has been sent to ${kitchen.KitchenName} kitchen`
          );
        }
      } else {
        console.log("Check: ", data);
      }
    }

    // return res.status(200).json("Success");
    return res.sendStatus(200);
  } catch (error) {
    console.log("catch error: ", error);
    const errMessage = Message(500, InternalError);
    return res.status(500).json(errMessage);
  }
};
