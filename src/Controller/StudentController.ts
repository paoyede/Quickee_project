import { IAllUsersOrders, IUpdatePassword } from "./../Models/IStudent";
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
import { RandGenSixDigitNum, cryptoGenTrxRef } from "../Utilities/RandomNumber";

const stdTab = "Student";
const dbId = "Email";
const dbid2 = "UserName";
const rtokTab = "RefreshToken";
const ordTab = "Orders";
const aOrdTab = "AllUsersOrders";
const forgot = "ForgotPassword";

export const signup = async (req: Request, res: Response): Promise<any> => {
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
    // producer.publishMessage("This is a test");
    const response = await AddToDB(stdTab, payload);
    const success = Message(200, CreateSuccess, response);
    res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const payload: ISignIn = req.body;
    const userId = payload.UserName;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbid2, userId);
    if (isUserExist == null) {
      const error = Message(400, UserNotFound);
      return res.status(400).json(error);
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
    const success = Message(200, LoginSuccess, isUserExist, tokens);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
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
    //await producer.publishMessage("testing");
    if (checkForgot === null) {
      await AddToDB(forgot, payload);
    } else {
      // delete payload.Id;
      await Update(forgot, "Id", userId, payload);
    }
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

    const newResponse = { Reference: allOrderData.TrxRef };
    const success = Message(200, CreateSuccess, newResponse);
    res.status(200).json(success);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};
