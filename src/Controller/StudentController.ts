import {
  LoginSuccess,
  WrongPassword,
  userNotFound,
  CreateSuccess,
  InternalError,
  UserIsExist,
  ResetLinkSent,
} from "../Response/Responses";
import { ISignIn } from "../Models/IStudent";
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
import { generateSixDigitNumber } from "../Utilities/RandomNumber";

const stdTab = "Student";
const dbId = "Email";
const dbid2 = "UserName";
const rtokTab = "RefreshToken";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: ISignUp = req.body;
    const userId = payload.Email;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      res.status(400).json(error);
    } else {
      const username = (payload.UserName =
        payload.FirstName + "." + payload.LastName);
      payload.UserName = username;
      const hash = await bcrypt.hash(payload.Password, 10);
      payload.Password = hash;
      // producer.publishMessage("This is a test");
      const response = await AddToDB(stdTab, payload);
      const success = Message(200, CreateSuccess, response);
      res.status(200).json(success);
    }
    // console.log(payload);
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
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
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
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.query.email.toString();
    console.log("email: ", email);
    var isUserExist = await FirstOrDefault(stdTab, dbId, email);
    if (isUserExist === null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      const userId = isUserExist.Id;
      const forgotDigit = generateSixDigitNumber();
      const payload = { Id: userId, ForgotPin: forgotDigit };
      const forgot = "ForgotPassword";
      var checkForgot = await FirstOrDefault(forgot, "Id", userId);
      //await producer.publishMessage("testing");
      if (checkForgot === null) {
        await AddToDB(forgot, payload);
      } else {
        delete payload.Id;
        await Update(forgot, "Id", userId, payload);
      }
      const success = Message(200, LoginSuccess, isUserExist, ResetLinkSent);
      return res.status(200).json(success);
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};
