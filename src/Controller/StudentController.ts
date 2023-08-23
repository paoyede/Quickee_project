import { IEmailRequest } from "./../Models/IEmail";
import {
  IAllUsersOrders,
  IUpdatePassword,
  IVerifyEmail,
} from "./../Models/IStudent";
import {
  LoginSuccess,
  WrongPassword,
  UserNotFound,
  CreateSuccess,
  InternalError,
  UserIsExist,
  ResetLinkSent,
  WrongOtp,
  UpdateSuccess,
  UnverifiedEmail,
} from "../Response/Responses";
import { IOrder, ISignIn } from "../Models/IStudent";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  AddToDB,
  FirstOrDefault,
  GetAll,
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
  cryptoGenTrxRef,
} from "../Utilities/RandomNumber";
import Producer from "../Services/Implementations/MessageBroker/Producer";

const stdTab = "Student";
const dbId = "Email";
const dbid2 = "UserName";
const rtokTab = "RefreshToken";
const ordTab = "Orders";
const aOrdTab = "AllUsersOrders";
const forgot = "ForgotPassword";

// const producer = new Producer();

export const signup = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const payload: ISignUp = req.body;
    const userId = payload.Email;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      return res.status(400).json(error);
    }

    const username = (payload.UserName =
      payload.FirstName + "." + payload.LastName);
    payload.UserName = username;
    const hash = await bcrypt.hash(payload.Password, 10);
    payload.Password = hash;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, stdTab, vcode);
    payload.VerificationCode = genCode;

    const response = await AddToDB(stdTab, payload);
    delete response.VerificationCode;
    const success = Message(200, CreateSuccess, response);

    const rabbitmqPayload: IEmailRequest = {
      Name: payload.LastName,
      Code: genCode,
      Reciever: payload.Email,
      Type: "Email verification",
    };

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
    const payload: ISignIn = req.body;
    const userId = payload.UserName;
    var isUserExist = await FirstOrDefault(stdTab, dbid2, userId);

    if (isUserExist === null) {
      const error = Message(400, UserNotFound);
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
    const email = req.query.email.toString();
    var isUserExist = await FirstOrDefault(stdTab, dbId, email);
    if (isUserExist === null) {
      const error = Message(400, UserNotFound);
      return res.status(400).json(error);
    }

    const forgot = "ForgotPassword";
    const userId = isUserExist.Id;
    const forgotDigit = await RandGenSixDigitNum(6, forgot, "ForgotPin");
    const payload = { Id: userId, ForgotPin: forgotDigit };
    var checkForgot = await FirstOrDefault(forgot, "Id", userId);

    if (checkForgot === null) {
      await AddToDB(forgot, payload);
    } else {
      // delete payload.Id;
      await Update(forgot, "Id", userId, payload);
    }

    const rabbitmqPayload: IEmailRequest = {
      Name: isUserExist.LastName,
      Code: forgotDigit,
      Reciever: email,
      Type: "Reset password",
    };
    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString); // Using the producer instance from the middleware

    const success = Message(200, ResetLinkSent, ResetLinkSent);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const payload: IUpdatePassword = req.body;
    var isOtpExist = await FirstOrDefault(forgot, "ForgotPin", payload.OTP);
    if (isOtpExist === null) {
      const error = Message(400, WrongOtp);
      return res.status(400).json(error);
    }

    const userId = isOtpExist.Id;
    const hash = await bcrypt.hash(payload.NewPassword, 10);
    const newPassword = { Password: hash };
    await Update(stdTab, "Id", userId, newPassword);

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
    var isUserExist = await FirstOrDefault(stdTab, dbId, payload.Email);
    if (isUserExist === null) {
      const error = Message(400, UserNotFound);
      return res.status(400).json(error);
    }

    if (isUserExist.VerificationCode != payload.EmailOTP) {
      const error = Message(400, WrongOtp);
      return res.status(400).json(error);
    }

    const updateEmail = { UpdatedAt: new Date(), IsVerifiedEmail: true };
    await Update(stdTab, dbId, payload.Email, updateEmail);

    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const saveOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const email = req.query.Email.toString();
    const payload: IOrder = req.body;

    var isUserExist = await FirstOrDefault(stdTab, dbId, email);
    if (isUserExist === null) {
      const error = Message(400, UserNotFound);
      res.status(400).json(error);
    }

    const totalSum = payload.Items.reduce((sum, item) => sum + item.Price, 0);
    const allOrderData: IAllUsersOrders = {
      KitchenId: payload.KitchenId,
      UserId: payload.UserId,
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
    res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};
