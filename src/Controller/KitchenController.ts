import {
  CreateFoodMenu,
  IKitchenCreate,
  IKitchenLogin,
  IKitchenUpdate,
  UpdateFoodMenu,
} from "./../Models/IKitchen";
import {
  ExpiredOTP,
  FetchedSuccess,
  LoginSuccess,
  ResetLinkSent,
  UnverifiedEmail,
  UpdateSuccess,
  NotFoundResponse,
  WrongOtp,
  WrongPassword,
  DeletedResponse,
  AlreadyExistResponse,
} from "../Response/Responses";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import {
  AddToDB,
  FirstOrDefault,
  GetAll,
  GetAllById,
  Remove,
  Update,
} from "../Infrastructure/Repository";
import { CreateSuccess, InternalError } from "../Response/Responses";
import { Message } from "../Response/IResponse";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Services/Implementations/JwtService";
import {
  CryptoGenSixDigitNum,
  RandGenSixDigitNum,
} from "../Utilities/RandomNumber";
import { IEmailRequest } from "../Models/IEmail";
import Producer from "../Services/Implementations/MessageBroker/Producer";
import { IResetPassword, IVerifyEmail } from "../Models/IStudent";
import { Validation, isValidPayload } from "./StudentController";
import {
  CreateFoodMenuDto,
  IKitchenCreateDto,
  createkitchenKeys,
  foodmenukeys,
} from "../Models/DTOs/IKitchenDto";

const kTab = "Kitchen";
const kmTab = "KitchenMenu";
const dbId = "KitchenEmail";
const dbid2 = "AdminEmail";
const rtokTab = "RefreshToken";
const forgot = "ForgotPassword";

export const createKitchen = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: IKitchenCreateDto = req.body;

    if (!isValidPayload(checkPayload, createkitchenKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const payload: IKitchenCreate = { ...checkPayload };

    const userId = payload.KitchenEmail;
    // console.log(userId);
    var isUserExist = await FirstOrDefault(kTab, dbId, userId);
    if (isUserExist != null) {
      const error = Message(400, AlreadyExistResponse("User"));
      return res.status(400).json(error);
    }
    const hash = await bcrypt.hash(payload.KitchenPassword, 10);
    payload.KitchenPassword = hash;
    const hash2 = await bcrypt.hash(payload.AdminPassword, 10);
    payload.AdminPassword = hash2;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, kTab, vcode);
    payload.VerificationCode = genCode;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    payload.ExpiresAt = currentTime;

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "kitchenreg",
      Type: "Email verification",
      Name: payload.Name,
      Payload: new Map([["Code", genCode]]),
      Reciever: payload.KitchenEmail,
    };

    // Convert the Map to an array of key-value pairs
    const payloadArray = Array.from(rabbitmqPayload.Payload);
    // Update the original object with the array
    rabbitmqPayload.Payload = payloadArray;

    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString); // Using the producer instance from the middleware
    const response = await AddToDB(kTab, payload);
    const success = Message(200, CreateSuccess, response);
    return res.status(200).json(success);

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
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    if (isUserExist.IsVerifiedEmail === false) {
      const error = Message(403, UnverifiedEmail);
      return res.status(403).json(error);
    }

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
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const payload: IVerifyEmail = req.body;
    var isUserExist = await FirstOrDefault(kTab, dbId, payload.Email);
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
    await Update(kTab, dbId, payload.Email, updateEmail);

    const success = Message(200, UpdateSuccess);
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
    let userEmail, userName, isUserExist;
    isUserExist = await FirstOrDefault(kTab, dbId, email);
    if (isUserExist != null) {
      userEmail = isUserExist.KitchenEmail;
      userName = extractSurname(isUserExist.Manager);
    } else if (isUserExist === null) {
      isUserExist = await FirstOrDefault(kTab, dbid2, email);
      userEmail = isUserExist.AdminEmail;
      userName = extractSurname(isUserExist.AdminName);
    }

    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const forgot = "ForgotPassword";
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
      Name: userName,
      Payload: new Map([["Code", forgotDigit]]),
      Reciever: email,
    };

    // Convert the Map to an array of key-value pairs
    const payloadArray = Array.from(rabbitmqPayload.Payload);
    // Update the original object with the array
    rabbitmqPayload.Payload = payloadArray;

    const rabbitmqPayloadString = JSON.stringify(rabbitmqPayload);
    producer.publishMessage(rabbitmqPayloadString); // Using the producer instance from the middleware

    const success = Message(200, ResetLinkSent);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const payload: IResetPassword = req.body;
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

    var isUserKitchen = await FirstOrDefault(kTab, dbId, userId);
    var isUserAdmin = await FirstOrDefault(kTab, dbid2, userId);
    let dbParam =
      isUserKitchen != null && isUserAdmin === null
        ? dbId
        : isUserKitchen === null && isUserAdmin != null
        ? dbid2
        : "";

    const newPassword =
      dbParam === dbId ? { KitchenPassword: hash } : { AdminPassword: hash };
    if (dbParam != "") await Update(kTab, dbParam, userId, newPassword);
    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
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
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    compareAndUpdateProperties(editedKitchen, isKitchenExist);
    const update = await Update(kTab, dbId, email, isKitchenExist);
    const response = Message(200, UpdateSuccess, update);

    return res.status(200).json(response);
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
      const error = Message(400, NotFoundResponse("Kitchen"));
      res.status(400).json(error);
    } else {
      await Remove(kTab, dbId, email);
      res.status(200).json(DeletedResponse("Kitchen", email));
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const createFoodMenu = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: CreateFoodMenuDto = req.body;

    if (!isValidPayload(checkPayload, foodmenukeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const payload: CreateFoodMenu = { ...checkPayload };
    const kId = payload.FoodName;
    const kId2 = payload.KitchenId;
    const dbkId = "FoodName";
    const dbkId2 = "Id";
    var isKitchenExist = await FirstOrDefault(kTab, dbkId2, kId2);
    var isFoodExist = await FirstOrDefault(kmTab, dbkId, kId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      res.status(400).json(error);
    } else if (isFoodExist != null) {
      const error = Message(400, AlreadyExistResponse("Food"));
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

export const updateFoodMenu = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload: UpdateFoodMenu = req.body;
    const menuId = req.query.MenuId.toString();
    var isFoodExist = await FirstOrDefault(kmTab, "Id", menuId);
    if (isFoodExist === null) {
      const error = Message(400, NotFoundResponse("Food"));
      res.status(400).json(error);
    } else {
      const kitchenId = isFoodExist.KitchenId;
      var isKitchenExist = await FirstOrDefault(kTab, "Id", kitchenId);

      if (isKitchenExist === null) {
        const error = Message(400, NotFoundResponse("Kitchen"));
        res.status(400).json(error);
      } else {
        // producer.publishMessage("This is a test");
        const response = await Update(kmTab, "Id", menuId, payload);
        const success = Message(200, UpdateSuccess, response);
        res.status(200).json(success);
      }
    }
  } catch (error) {
    console.log(error);
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const deleteFoodMenu = async (req: Request, res: Response) => {
  try {
    const menuId = req.query.MenuId.toString();
    const isKitchenExist = await FirstOrDefault(kmTab, "Id", menuId);

    if (isKitchenExist == null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      res.status(400).json(error);
    } else {
      await Remove(kmTab, "Id", menuId);
      res.status(200).json(DeletedResponse("FoodMenu", menuId));
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const getKitchenMenusById = async (req: Request, res: Response) => {
  try {
    const kitchenId = req.query.KitchenId.toString();
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitchenId);

    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    const foodMenus = await GetAllById(kmTab, "KitchenId", kitchenId);

    const success = Message(200, FetchedSuccess, foodMenus);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const compareAndUpdateProperties = (
  incomingData: any,
  existingData: any
) => {
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

const extractSurname = (fullName: string) => {
  let firstName, lastName;
  const nameParts = fullName.split(" ");

  if (nameParts.length > 0) {
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else {
    // console.log("Invalid full name format.");
  }
  return lastName;
};
