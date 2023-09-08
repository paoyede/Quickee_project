import { Request, Response } from "express";
import crypto from "crypto";
import { paystacksecret } from "../Utilities/Configs";
import { Message } from "../Response/IResponse";
import { InternalError } from "../Response/Responses";
import {
  AddToDB,
  FirstOrDefault,
  GetAllById,
  FirstOrDefaultQueryable,
  Update,
} from "../Infrastructure/Repository";
import { IPaymentDto, ITransferDBDto, ITransferDto } from "../Models/IKitchen";
import { transferToKitchen } from "../Services/Implementations/PayStack";
import { RandGenTrxRef } from "../Utilities/RandomNumber";
import { IDebit, IWallet } from "../Models/IStudent";
import {
  Id,
  aOrdTab,
  dbkId,
  debTab,
  depTab,
  kTab,
  kmTab,
  ordTab,
  orderId,
  pTab,
  recTab,
  sTab,
  trRef,
  trTab,
  trxRef,
  uid,
  wTab,
} from "../Data/TableNames";

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
        if (refLength === 7 /* card payment */) {
          var fetchOrder = await FirstOrDefault(aOrdTab, trxRef, reference);
          const kitId = fetchOrder.KitchenId;
          const ordId = fetchOrder.OrderId;
          await Update(aOrdTab, trxRef, reference, {
            ...fetchOrder,
            IsPaid: true,
            UpdatedAt: currentTime,
          });

          const payment: IPaymentDto = {
            KitchenId: kitId,
            UserId: fetchOrder.UserId,
            OrderId: ordId,
            TrxRef: fetchOrder.TrxRef,
            IsSuccess: true,
            Amount: fetchOrder.TotalAmount,
          };

          await AddToDB(pTab, payment);
          var fetchRecipient = await FirstOrDefault(recTab, dbkId, kitId);
          var kitchen = await FirstOrDefault(kTab, "Id", kitId);
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
            OrderId: ordId,
            RecipientCode: fetchRecipient.RecipientCode,
            Reference: ref,
            Status: "pending",
          };

          await AddToDB(trTab, transferdb);

          // ensure update kitchen menu total quantity
          const payload = await GetAllById(ordTab, orderId, ordId);
          for (let index = 0; index < payload.length; index++) {
            const eOrder = payload[index];
            const queryParams = { KitchenId: kitId, FoodName: eOrder.Name };
            const getMenu = await FirstOrDefaultQueryable(
              kmTab,
              queryParams,
              "and"
            );
            const qty = parseInt(getMenu.TotalQuantity);
            const ordQty = parseInt(eOrder.Scoops);
            await Update(kmTab, Id, getMenu.Id, {
              TotalQuantity: qty - ordQty,
            });
          }
        } else if (refLength === 8 /*funding wallet */) {
          var fetchDep = await FirstOrDefault(depTab, trxRef, reference);
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
          const kitchen = await FirstOrDefault(kTab, "Id", transfer.KitchenId);
          const dboid = "OrderId";
          const oid = transfer.OrderId;
          const fetchOrder = await FirstOrDefault(aOrdTab, dboid, oid);
          const kitId = fetchOrder.KitchenId;
          const ordId = fetchOrder.OrderId;

          await Update(trTab, trRef, ref, payload);

          if (refLength === 17 /* buy from wallet */) {
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
            await Update(aOrdTab, trxRef, fetchOrder.TrxRef, {
              ...fetchOrder,
              IsPaid: true,
              UpdatedAt: currentTime,
            });

            await AddToDB(debTab, debit);

            // ensure update kitchen menu total quantity
            const payload = await GetAllById(ordTab, orderId, ordId);
            for (let index = 0; index < payload.length; index++) {
              const eOrder = payload[index];
              const queryParams = { KitchenId: kitId, FoodName: eOrder.Name };
              const getMenu = await FirstOrDefaultQueryable(
                kmTab,
                queryParams,
                "and"
              );
              const qty = parseInt(getMenu.TotalQuantity);
              const ordQty = parseInt(eOrder.Scoops);
              await Update(kmTab, Id, getMenu.Id, {
                TotalQuantity: qty - ordQty,
              });
            }

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
