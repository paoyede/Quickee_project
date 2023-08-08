import { Request, Response } from "express";
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

const stdTab = "Student";
const dbId = "Email";
export const signup = async (req: Request, res: Response): Promise<void> => {
  const payload: ISignUp = req.body;
  try {
    const userId = payload.Email;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(stdTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, UserIsExist);
      res.status(400).json(error);
    } else {
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
  } catch (error) {}
};
