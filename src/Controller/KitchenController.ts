import {
  IKitchenCreate,
  IKitchenLogin,
  IKitchenUpdate,
} from "./../Models/IKitchen";
import {
  LoginSuccess,
  StaffDeleted,
  UpdateSuccess,
  WrongPassword,
  userNotFound,
} from "../Response/Responses";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  AddToDB,
  AlterTable,
  CreateDatabase,
  CreateTable,
  FirstOrDefault,
  GetAll,
  Remove,
  Update,
} from "../Infrastructure/Repository";
import {
  CreateSuccess,
  InternalError,
  UserIsExist,
} from "../Response/Responses";
import { Message } from "../Response/IResponse";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Services/Implementations/JwtService";

const stdTab = "Kitchen";
const dbId = "KitchenEmail";
const dbid2 = "AdminEmail";
const rtokTab = "RefreshToken";

export const createKitchen = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: IKitchenCreate = req.body;
    const userId = payload.KitchenEmail;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      res.status(400).json(error);
    } else {
      const hash = await bcrypt.hash(payload.KitchenPassword, 10);
      payload.KitchenPassword = hash;
      const hash2 = await bcrypt.hash(payload.AdminPassword, 10);
      payload.AdminPassword = hash2;
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
    const payload: IKitchenLogin = req.body;
    const userId = payload.Email;
    // console.log(userId);
    var dbid = payload.IsAdmin ? dbid2 : dbId;
    var isUserExist = await FirstOrDefault(stdTab, dbid, userId);

    if (isUserExist == null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      var userPassword = payload.IsAdmin
        ? isUserExist.AdminPassword
        : isUserExist.KitchenPassword;
      const isMatched = await bcrypt.compare(payload.Password, userPassword);
      if (!isMatched) {
        const error = Message(400, WrongPassword);
        return res.status(400).json(error);
      }
      const jwtPayLoad = { Email: payload.Email, Id: isUserExist.Id };
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

export const updateKitchen = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const editedStaff: IKitchenUpdate = req.body;
    const isStaffExist = await FirstOrDefault(stdTab, dbId, email);
    if (isStaffExist == null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      const update = await Update(stdTab, dbId, email, editedStaff);
      const response = Message(200, UpdateSuccess, update);
      res.status(200).json(response);
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const deleteKitchen = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const isStaffExist = await FirstOrDefault(stdTab, dbId, email);

    if (isStaffExist == null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      await Remove(stdTab, dbId, email);
      res.status(200).json(StaffDeleted(email));
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const createFoodMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: IKitchenCreate = req.body;
    const userId = payload.KitchenEmail;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      res.status(400).json(error);
    } else {
      const hash = await bcrypt.hash(payload.KitchenPassword, 10);
      payload.KitchenPassword = hash;
      const hash2 = await bcrypt.hash(payload.AdminPassword, 10);
      payload.AdminPassword = hash2;
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
