import {
  CreateFoodMenu,
  IKitchenCreate,
  IKitchenLogin,
  IKitchenUpdate,
} from "./../Models/IKitchen";
import {
  FoodIsExist,
  KitchenDeleted,
  KitchenNotFound,
  LoginSuccess,
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
import client from "Database/Postgres";

const kTab = "Kitchen";
const kmTab = "KitchenMenu";
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
    var isUserExist = await FirstOrDefault(kTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      res.status(400).json(error);
    } else {
      const hash = await bcrypt.hash(payload.KitchenPassword, 10);
      payload.KitchenPassword = hash;
      const hash2 = await bcrypt.hash(payload.AdminPassword, 10);
      payload.AdminPassword = hash2;
      // producer.publishMessage("This is a test");
      const response = await AddToDB(kTab, payload);
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
    var isUserExist = await FirstOrDefault(kTab, dbid, userId);

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
    const email = req.query.email.toString();
    const editedKitchen: IKitchenUpdate = req.body;
    const isKitchenExist = await FirstOrDefault(kTab, dbId, email);
    if (isKitchenExist == null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      compareAndUpdateProperties(editedKitchen, isKitchenExist);
      const update = await Update(kTab, dbId, email, isKitchenExist);
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
    const email = req.query.email.toString();
    const isKitchenExist = await FirstOrDefault(kTab, dbId, email);

    if (isKitchenExist == null) {
      const error = Message(400, userNotFound);
      res.status(400).json(error);
    } else {
      await Remove(kTab, dbId, email);
      res.status(200).json(KitchenDeleted(email));
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
    const payload: CreateFoodMenu = req.body;

    const kId = payload.FoodName;
    const kId2 = payload.KitchenId;
    const dbkId = "FoodName";
    const dbkId2 = "KitchenId";
    var isKitchenExist = await FirstOrDefault(kmTab, dbkId2, kId2);
    var isFoodExist = await FirstOrDefault(kmTab, dbkId, kId);
    if (isKitchenExist === null) {
      const error = Message(400, KitchenNotFound);
      res.status(400).json(error);
    } else if (isFoodExist != null) {
      const error = Message(400, FoodIsExist);
      res.status(400).json(error);
    } else {
      // producer.publishMessage("This is a test");
      const response = await AddToDB(kmTab, payload);
      const success = Message(200, CreateSuccess, response);
      res.status(200).json(success);
    }
    // console.log(payload);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

const compareAndUpdateProperties = (incomingData: any, existingData: any) => {
  const properties = Object.keys(incomingData);
  const propertiesDB = Object.keys(existingData);

  for (const incomingKey of properties) {
    const incomingValue = incomingData[incomingKey];

    for (const dbKey of propertiesDB) {
      if (dbKey === "Id") continue;

      const dbValue = existingData[dbKey];

      if (incomingKey === dbKey) {
        // typeof will return object if the value is array or object
        const dbValueType = typeof dbValue === "object";
        const incomingValueType = typeof incomingValue === "object";
        const isNullOrUndefined =
          incomingValue === undefined || incomingValue === null;

        if (dbValueType && incomingValueType && !isNullOrUndefined) {
          if (Array.isArray(incomingValue)) {
            const objToList = incomingValue;
            const modelToList = dbValue || [];
            objToList.forEach((item) => modelToList.push(item.toString()));
            existingData[dbKey] = modelToList;
            break;
          } else {
            existingData[dbKey] = incomingValue;
          }
        } else if (!dbValueType && !incomingValueType && !isNullOrUndefined) {
          existingData[dbKey] = incomingValue;
        }
        break;
      } else if (incomingKey !== dbKey) {
        continue;
      }
    }
  }
};
