import { IEmailRequest } from "./../Models/IEmail";
import {
  IAllUsersOrders,
  IDeposit,
  IFundWallet,
  IResetPassword,
  IVerifyEmail,
} from "./../Models/IStudent";
import {
  LoginSuccess,
  WrongPassword,
  CreateSuccess,
  InternalError,
  ResetLinkSent,
  WrongOtp,
  UpdateSuccess,
  UnverifiedEmail,
  ExpiredOTP,
  VerifyEmail,
  DeletedResponse,
  NotFoundResponse,
  AlreadyExistResponse,
  FetchedSuccess,
} from "../Response/Responses";
import { IOrder, ISignIn } from "../Models/IStudent";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  AddToDB,
  FirstOrDefault,
  GetAll,
  GetAllById,
  FirstOrDefaultQueryable,
  Remove,
  Update,
} from "../Infrastructure/Repository";
import { Message } from "../Response/IResponse";
import { ISignUp } from "../Models/IStudent";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Services/Implementations/JwtService";
import {
  CryptoGenSixDigitNum,
  RandGenSixDigitNum,
  RandGenTrxRef,
  cryptoGenTrxRef,
} from "../Utilities/RandomNumber";
import Producer from "../Services/Implementations/MessageBroker/Producer";
import {
  IAllQuickOrdersDto,
  IGetKitInUserUniversity,
  IOrderDto,
  IQuickOrderDto,
  ISignInDto,
  ISignUpDto,
  IUpdateQuickOrderDto,
  ItemDto,
  UpdateItemDto,
  orderKeys,
  qorderKeys,
  studSigninKeys,
  studSignupKeys,
  updateQOrderKeys,
} from "../Models/DTOs/IStudentDto";
import {
  Validation,
  compareAndUpdateProperties,
  isValidPayload,
} from "../Utilities/Validations";
import {
  IFirebaseUserToken,
  IGetOrdersDto,
  IGetStudentOrdersDto,
  IReview,
  IUpdateReview,
  fcmTokenkeys,
  reviewkeys,
} from "../Models/DTOs/IKitchenDto";
import {
  paystackPayment,
  transferToKitchen,
} from "../Services/Implementations/PayStack";
import { IPayment } from "../Models/PayStack";
import { ITransferDBDto, ITransferDto } from "../Models/IKitchen";
import {
  Id,
  aOrdTab,
  aqOrdTab,
  dbEmail,
  dbid2,
  dbkId,
  depTab,
  forgot,
  kTab,
  kmTab,
  notifyTab,
  ordTab,
  orderId,
  qordTab,
  recTab,
  revParam,
  revTab,
  rtokTab,
  sTab,
  trRef,
  trTab,
  uid,
  uni,
  wTab,
} from "../Data/TableNames";
import * as path from "path";

const currentTime = new Date();

// const producer = new Producer();

export const signup = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: ISignUpDto = req.body;

    if (!isValidPayload(checkPayload, studSignupKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const payload: ISignUp = {
      ...checkPayload,
    };
    const userId = payload.Email;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(sTab, dbEmail, userId);
    if (isUserExist != null) {
      const error = Message(400, AlreadyExistResponse("User"));
      return res.status(400).json(error);
    }

    const username = (payload.UserName =
      payload.FirstName + "." + payload.LastName);
    payload.UserName = username;
    const hash = await bcrypt.hash(payload.Password, 10);
    payload.Password = hash;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, sTab, vcode);
    payload.VerificationCode = genCode;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    payload.ExpiresAt = currentTime;

    const response = await AddToDB(sTab, payload);
    delete response.VerificationCode;
    delete response.ExpiresAt;
    const success = Message(200, CreateSuccess, response);

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "studentreg",
      Type: "Email verification",
      Name: payload.LastName,
      Payload: new Map([["Code", genCode]]),
      Reciever: payload.Email,
    };

    // Convert the Map to an array of key-value pairs
    const payloadArray = Array.from(rabbitmqPayload.Payload);
    // Update the original object with the array
    rabbitmqPayload.Payload = payloadArray;

    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString); // Using the producer instance from the middleware
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const checkPayload: ISignInDto = req.body;

    if (!isValidPayload(checkPayload, studSigninKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }
    const payload: ISignIn = { ...checkPayload };
    const userId = payload.UserName;
    var isUserExist = await FirstOrDefault(sTab, dbid2, userId);

    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    if (isUserExist.IsVerifiedEmail === false) {
      const error = Message(403, UnverifiedEmail);
      return res.status(403).json(error);
    }

    const isMatched = await bcrypt.compare(
      payload.Password,
      isUserExist.Password
    );
    if (!isMatched) {
      const error = Message(400, WrongPassword);
      return res.status(400).json(error);
    }
    const jwtPayLoad = { Email: isUserExist.Email, Id: isUserExist.Id };
    const refreshtoken = generateRefreshToken(jwtPayLoad);
    const accesstoken = generateAccessToken(jwtPayLoad);
    //save refresh token
    const newRToken = { RefreshToken: refreshtoken };
    await AddToDB(rtokTab, newRToken);
    //await producer.publishMessage("testing");
    //------------------
    const tokens = {
      accesstoken: accesstoken,
      refreshtoken: refreshtoken,
    };
    delete isUserExist.VerificationCode;
    delete isUserExist.ExpiresAt;
    const success = Message(200, LoginSuccess, isUserExist, tokens);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const forgotPassword = async (
  producer: Producer,
  req: Request,
  res: Response
) => {
  try {
    const email = req.query.Email.toString();
    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const userEmail = isUserExist.Email;
    const forgotDigit = await RandGenSixDigitNum(6, forgot, "ForgotPin");
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    const payload = {
      UserEmail: userEmail,
      ForgotPin: forgotDigit,
      ExpiresAt: currentTime,
    };
    var checkForgot = await FirstOrDefault(forgot, "UserEmail", userEmail);

    if (checkForgot === null) {
      await AddToDB(forgot, payload);
    } else {
      // delete payload.Id;
      await Update(forgot, "UserEmail", userEmail, payload);
    }

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "forgotpassword",
      Type: "Reset password",
      Name: isUserExist.LastName,
      Payload: new Map([["Code", forgotDigit]]),
      Reciever: email,
    };

    // Convert the Map to an array of key-value pairs
    const payloadArray = Array.from(rabbitmqPayload.Payload);
    // Update the original object with the array
    rabbitmqPayload.Payload = payloadArray;

    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString); // Using the producer instance from the middleware

    const success = Message(200, ResetLinkSent, ResetLinkSent);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const payload: IResetPassword = req.body;
    const emptyFields = Validation(payload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    var isOtpExist = await FirstOrDefault(forgot, "ForgotPin", payload.OTP);
    if (isOtpExist === null || isOtpExist.UserEmail != payload.Email) {
      const error = Message(400, WrongOtp);
      return res.status(400).json(error);
    }

    if (isOtpExist.ExpiresAt < new Date()) {
      const error = Message(400, ExpiredOTP);
      return res.status(400).json(error);
    }

    const userId = isOtpExist.UserEmail;
    const hash = await bcrypt.hash(payload.NewPassword, 10);
    const newPassword = { Password: hash };
    await Update(sTab, "Email", userId, newPassword);

    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const payload: IVerifyEmail = req.body;
    const emptyFields = Validation(payload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, dbEmail, payload.Email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    if (isUserExist.VerificationCode != payload.EmailOTP) {
      const error = Message(400, WrongOtp);
      return res.status(400).json(error);
    }

    if (isUserExist.ExpiresAt < new Date()) {
      const error = Message(400, ExpiredOTP);
      return res.status(400).json(error);
    }

    const updateEmail = { UpdatedAt: new Date(), IsVerifiedEmail: true };
    await Update(sTab, dbEmail, payload.Email, updateEmail);

    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const resendVerifyEmail = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    // console.log("Email: ", email);
    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, sTab, vcode);
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);

    const payload = { ExpiresAt: currentTime, VerificationCode: genCode };
    await Update(sTab, dbEmail, email, payload);

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "studentreg",
      Type: "Email verification",
      Name: isUserExist.LastName,
      Payload: new Map([["Code", genCode]]),
      Reciever: email,
    };

    const payloadArray = Array.from(rabbitmqPayload.Payload);
    rabbitmqPayload.Payload = payloadArray;
    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString);
    const success = Message(200, VerifyEmail);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError, error);
    return res.status(500).json(err);
  }
};

export const saveOrders = async (req: Request, res: Response): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    const checkPayload: IOrderDto = req.body;
    const payload: IOrder = { ...checkPayload };

    if (!isValidPayload(checkPayload, orderKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const kitId = payload.KitchenId;
    // console.log(userId);
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    // ensure there is scoops for kitchen menu
    for (let index = 0; index < payload.Items.length; index++) {
      const eOrder = payload.Items[index];
      const queryParams = { KitchenId: kitId, FoodName: eOrder.Name };
      const getMenu = await FirstOrDefaultQueryable(kmTab, queryParams, "and");
      const qty = parseInt(getMenu.TotalQuantity);
      if (qty < eOrder.Scoops && qty != 0) {
        const msg = `Not enough scoops for ${eOrder.Name}, we have ${qty} scoops left`;
        const error = Message(400, msg);
        return res.status(400).json(error);
      } else if (qty < eOrder.Scoops && qty === 0) {
        await Update(kmTab, "Id", getMenu.Id, { Status: "finished" });
        const msg = `${eOrder.Name} has finished, please check back later`;
        const error = Message(400, msg);
        return res.status(400).json(error);
      }
    }

    const totalSum = payload.Items.reduce((sum, item) => sum + item.Price, 0);
    const allOrderData: IAllUsersOrders = {
      KitchenId: payload.KitchenId,
      UserId: isUserExist.Id,
      Description: payload.Description,
      TotalAmount: totalSum,
      TrxRef: await cryptoGenTrxRef(7, aOrdTab, "TrxRef"),
    };

    const saveToAllorders = await AddToDB(aOrdTab, allOrderData);
    for (let index = 0; index < payload.Items.length; index++) {
      const eachOrder = payload.Items[index];
      eachOrder.OrderId = saveToAllorders.OrderId;
      await AddToDB(ordTab, eachOrder);
    }

    const newResponse = { OrderId: saveToAllorders.OrderId };
    const success = Message(200, CreateSuccess, newResponse);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError, error);
    return res.status(500).json(err);
  }
};

export const getOrdersByUserEmail = async (req: Request, res: Response) => {
  try {
    const email = req.query.Email.toString();

    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }
    const udbId = isUserExist.Id;
    const aQords = await GetAllById(aOrdTab, uid, udbId);
    let newAQorders: IGetStudentOrdersDto = {
      UserId: aQords.at(0).UserId,
      Orders: [],
    };

    for (let index = 0; index < aQords.length; index++) {
      let eOrders = aQords[index];
      const oid = eOrders.OrderId;
      // delete eOrders.CreatedAt;
      delete eOrders.UpdatedAt;
      delete eOrders.UserId;
      let order: IGetOrdersDto = { ...eOrders };
      const orders = await GetAllById(ordTab, orderId, oid);
      order.Items = orders;
      for (let i = 0; i < orders.length; i++) {
        delete orders[i].CreatedAt;
        delete orders[i].UpdatedAt;
        delete orders[i].OrderId;
        delete orders[i].Id;
      }
      newAQorders.Orders.push(order);
    }

    const success = Message(200, FetchedSuccess, newAQorders);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const saveQuickOrders = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    const checkPayload: IQuickOrderDto = req.body;
    const payload: IQuickOrderDto = { ...checkPayload };

    if (!isValidPayload(checkPayload, qorderKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const kitId = payload.KitchenId;
    // console.log(userId);
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const totalSum = payload.Items.reduce((sum, item) => sum + item.Price, 0);
    const allOrderData: IAllQuickOrdersDto = {
      KitchenId: payload.KitchenId,
      UserId: isUserExist.Id,
      Description: payload.Description,
      TotalAmount: totalSum,
      OrderName: payload.OrderName,
    };

    const saveToAllorders = await AddToDB(aqOrdTab, allOrderData);
    for (let index = 0; index < payload.Items.length; index++) {
      const eachOrder = payload.Items[index];
      eachOrder.OrderId = saveToAllorders.OrderId;
      await AddToDB(qordTab, eachOrder);
    }

    const newResponse = { OrderId: saveToAllorders.OrderId };
    const success = Message(200, CreateSuccess, newResponse);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const getQuickOrdersByUserId = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();

    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }
    const udbId = isUserExist.Id;
    const aQords = await GetAllById(aqOrdTab, uid, udbId);
    let newAQorders: IUpdateQuickOrderDto[] = [];
    if (aQords != null) {
      for (let index = 0; index < aQords.length; index++) {
        let eOrders = aQords[index];
        const oid = eOrders.OrderId;
        // delete eOrders.CreatedAt;
        // delete eOrders.UpdatedAt;
        const aqOrders = await GetAllById(qordTab, orderId, oid);
        for (let index = 0; index < aqOrders.length; index++) {
          const element = aqOrders[index];
          delete element.OrderId;
          delete element.CreatedAt;
          delete element.UpdatedAt;
        }
        const nobj: IUpdateQuickOrderDto = { ...eOrders };
        nobj.Items = aqOrders;
        newAQorders.push(nobj);
      }
    }

    const success = Message(200, FetchedSuccess, newAQorders);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const updateQuickOrders = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    const checkPayload: IUpdateQuickOrderDto = req.body;
    const payload: IUpdateQuickOrderDto = { ...checkPayload };

    if (!isValidPayload(checkPayload, updateQOrderKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const kitId = payload.KitchenId;
    // console.log(userId);
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const ordId = payload.OrderId;
    var isQuickOrderExist = await FirstOrDefault(aqOrdTab, orderId, ordId);
    if (isQuickOrderExist === null) {
      const error = Message(400, NotFoundResponse("QuickOrder"));
      return res.status(400).json(error);
    }

    const totalSum = payload.Items.reduce((sum, item) => sum + item.Price, 0);
    const allOrderData: IAllQuickOrdersDto = {
      KitchenId: payload.KitchenId,
      UserId: isUserExist.Id,
      Description: payload.Description,
      TotalAmount: totalSum,
      OrderName: payload.OrderName,
    };

    const saveToAllorders = await Update(
      aqOrdTab,
      orderId,
      ordId,
      allOrderData
    );
    const inItems = payload.Items;
    const getAllQorders = await GetAllById(qordTab, orderId, ordId);
    const allItems: UpdateItemDto[] = getAllQorders;
    compareAndUpdateProperties(inItems, allItems);
    // console.log(allItems);
    for (let index = 0; index < allItems.length; index++) {
      const eachOrder = allItems[index];
      eachOrder.OrderId = saveToAllorders.OrderId;
      const id = eachOrder.Id;
      await Update(qordTab, "Id", id, eachOrder);
    }

    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const deleteQuickOrders = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const qoId = req.query.QoId.toString();

    var isQOrderExist = await FirstOrDefault(aqOrdTab, "OrderId", qoId);
    if (isQOrderExist === null) {
      const error = Message(400, NotFoundResponse("QuickOrder"));
      return res.status(400).json(error);
    }

    await Remove(aqOrdTab, "OrderId", qoId);
    await Remove(qordTab, "OrderId", qoId);

    const newResponse = DeletedResponse("QuickOrder", qoId);
    const success = Message(200, newResponse);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const fundWallet = async (req: Request, res: Response): Promise<any> => {
  try {
    const payload: IFundWallet = req.body;
    var isUserExist = await FirstOrDefault(sTab, dbEmail, payload.email);

    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }
    const reference = await cryptoGenTrxRef(8, depTab, "TrxRef");
    const newPayload = {
      email: payload.email,
      reference: reference,
      amount: parseInt(payload.amount) * 100,
    };

    paystackPayment(newPayload)
      .then(async (response: any) => {
        // console.log(response);

        const deposit: IDeposit = {
          Amount: parseInt(payload.amount),
          Status: "pending",
          TrxRef: reference,
          UserId: isUserExist.Id,
        };

        await AddToDB(depTab, deposit);
        return res
          .status(200)
          .json(Message(200, "Payment link received", response));
      })
      .catch(async (error: any) => {
        // console.error("check: ", error.response.data);
        const response = error?.response?.data;
        return res.status(404).json(response);
      });
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const chargeWallet = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload: IPayment = req.body;
    var isUserExist = await FirstOrDefault(sTab, dbEmail, payload.email);

    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const orderId = payload.orderId;
    var fetchOrder = await FirstOrDefault(aOrdTab, "OrderId", orderId);
    if (fetchOrder === null) {
      const error = Message(400, NotFoundResponse("Order"));
      return res.status(400).json(error);
    }

    if (fetchOrder.IsPaid === true) {
      const error = Message(400, "Payment already made for this order");
      return res.status(400).json(error);
    }

    var fetchWallet = await FirstOrDefault(wTab, uid, fetchOrder.UserId);
    if (fetchWallet === null) {
      const error = Message(400, "No wallet found for this user");
      return res.status(400).json(error);
    }
    var balance = parseInt(fetchWallet.Balance);
    var ordAmt = parseInt(fetchOrder.TotalAmount);
    // console.log(ordAmt, " ,", balance);
    if (ordAmt > balance) {
      const error = Message(400, "Not enough wallet credit");
      return res.status(400).json(error);
    }

    var fetchRecipient = await FirstOrDefault(
      recTab,
      dbkId,
      fetchOrder.KitchenId
    );
    var kitchen = await FirstOrDefault(kTab, "Id", fetchOrder.KitchenId);
    const ref = await RandGenTrxRef(17, trTab, trRef);

    const transfer: ITransferDto = {
      source: "balance",
      amount: fetchOrder.TotalAmount * 100,
      reference: ref,
      recipient: fetchRecipient.RecipientCode,
      reason: `Transfer order money to ${kitchen.KitchenName} kitchen`,
    };

    await transferToKitchen(transfer);

    const transferdb: ITransferDBDto = {
      KitchenId: fetchOrder.KitchenId,
      OrderId: fetchOrder.OrderId,
      RecipientCode: fetchRecipient.RecipientCode,
      Reference: ref,
      Status: "pending",
    };

    await AddToDB(trTab, transferdb);
    return res.status(200).json(Message(200, "Processing payment"));
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const registerDeviceToken = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: IFirebaseUserToken = req.body;

    if (!isValidPayload(checkPayload, fcmTokenkeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, Id, checkPayload.UserId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    var checkNotify = await FirstOrDefault(notifyTab, uid, checkPayload.UserId);
    if (checkNotify != null) {
      if (checkNotify.FcmToken === checkPayload.FcmToken) {
        const success = Message(200, AlreadyExistResponse("FcmToken"));
        return res.status(200).json(success);
      } else if (checkNotify.FcmToken != checkPayload.FcmToken) {
        const response = await Update(notifyTab, uid, checkPayload.UserId, {
          FcmToken: checkPayload.FcmToken,
          UpdatedAt: currentTime,
        });
        const success = Message(200, CreateSuccess, response);
        return res.status(200).json(success);
      }
    }

    const response = await AddToDB(notifyTab, checkPayload);
    const success = Message(200, CreateSuccess, response);
    return res.status(200).json(success);

    // console.log(payload);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const writeReview = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: IReview = req.body;

    if (!isValidPayload(checkPayload, reviewkeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(kTab, Id, checkPayload.KitchenId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, Id, checkPayload.UserId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const rev = checkPayload.Review;
    var isUserExist = await FirstOrDefault(revTab, revParam, rev);
    if (isUserExist != null) {
      const error = Message(400, AlreadyExistResponse("This review"));
      return res.status(400).json(error);
    }

    checkPayload.Tag = await cryptoGenTrxRef(7, revTab, "Tag");
    checkPayload.AgreeCount = 0;
    checkPayload.DisagreeCount = 0;
    checkPayload.WhoDisliked = [""];
    checkPayload.WhoLiked = [""];

    // producer.publishMessage("This is a test");
    const response = await AddToDB(revTab, checkPayload);
    const success = Message(200, CreateSuccess, response);
    return res.status(200).json(success);

    // console.log(payload);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const revId = req.query.ReviewId.toString();
    const isReviewExist = await FirstOrDefault(revTab, "Id", revId);

    if (isReviewExist == null) {
      const error = Message(400, NotFoundResponse("Review"));
      return res.status(400).json(error);
    }

    await Remove(revTab, "Id", revId);
    return res.status(200).json(DeletedResponse("Review", revId));
  } catch (error) {
    const errMessage = Message(500, InternalError);
    return res.status(500).json(errMessage);
  }
};

export const updateReview = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload: IUpdateReview = req.body;

    const isReviewExist = await FirstOrDefault(revTab, "Id", payload.Id);
    if (isReviewExist === null) {
      const error = Message(400, NotFoundResponse("Review"));
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(sTab, Id, payload.UserId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    // compareAndUpdateProperties(payload, isReviewExist);
    const updatePayload = {
      UpdatedAt: currentTime,
      AgreeCount: payload.WhoLiked.length,
      DisagreeCount: payload.WhoDisliked.length,
      WhoLiked: payload.WhoLiked,
      WhoDisliked: payload.WhoDisliked,
      Review: payload.Review,
    };
    const response = await Update(revTab, "Id", payload.Id, updatePayload);
    const success = Message(200, UpdateSuccess, response);
    return res.status(200).json(success);
  } catch (error) {
    console.log(error);
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const getKitchensInUserUniversity = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload: IGetKitInUserUniversity = req.body;
    const email = payload.Email;
    var isUserExist = await FirstOrDefault(sTab, dbEmail, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const univ = payload.University;
    const kitchens = await GetAllById(kTab, uni, univ);
    let response = [];
    // console.log(kitchens);
    if (kitchens.length > 0) {
      for (let index = 0; index < kitchens.length; index++) {
        const kitchen = kitchens[index];
        const kImg = kitchen.KitchenImage;
        const imgName = path.join(__dirname, "../Uploads", kImg);
        const kitResponse = {
          KitchenId: kitchen.Id,
          KitchenName: kitchen.KitchenName,
          KitchenImage: imgName,
        };
        response.push(kitResponse);
      }
    }
    const success = Message(200, FetchedSuccess, response);
    return res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

function findObjectById(Id: string, list: UpdateItemDto[]) {
  for (const obj of list) {
    if (obj.Id === Id) {
      return obj;
    }
  }
  return null; // Return null if no match is found
}
