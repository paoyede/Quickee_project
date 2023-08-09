import {
  LoginSuccess,
  WrongPassword,
  userNotFound,
} from "./../Response/Responses";
import { ISignIn } from "./../Models/ISignIn";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  AddToDB,
  AlterTable,
  CreateDatabase,
  CreateTable,
  FirstOrDefault,
  GetAll,
} from "../Infrastructure/Repository";
import {
  CreateSuccess,
  InternalError,
  UserIsExist,
} from "../Response/Responses";
import { Message } from "../Response/IResponse";
import { ISignUp } from "../Models/ISignUp";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Services/Implementations/JwtService";

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
    console.log(error);
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};
