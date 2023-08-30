import {
  IGetKitchenOrdersDto,
  IGetOrdersDto,
  addKitStaffKeys,
} from "./../Models/DTOs/IKitchenDto";
import {
  CreateFoodMenu,
  IAddKitchenStaff,
  IKitchenCreate,
  IKitchenLogin,
  IKitchenUpdate,
  IKitchenUpdateStaff,
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
  VerifyEmail,
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
const kstaffTab = "KitchenStaff";
const kmTab = "KitchenMenu";
const dbId = "KitchenEmail";
const dbid2 = "AdminEmail";
const dbEmail = "Email";
const rtokTab = "RefreshToken";
const forgot = "ForgotPassword";
const ordTab = "Orders";
const aOrdTab = "AllUsersOrders";
const dbkId = "KitchenId";

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
      const error = Message(400, AlreadyExistResponse("Kitchen"));
      return res.status(400).json(error);
    }

    const hash = await bcrypt.hash(payload.Password, 10);
    payload.Password = hash;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, kTab, vcode);
    payload.VerificationCode = genCode;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    payload.ExpiresAt = currentTime;
    payload.Role = "superadmin";

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "kitchenreg",
      Type: "Email verification",
      Name: payload.ManagerLastName,
      Payload: new Map([["Code", genCode]]),
      Reciever: payload.ManagerEmail,
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

export const addKitchenStaff = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const checkPayload: IAddKitchenStaff = req.body;

    if (!isValidPayload(checkPayload, addKitStaffKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const payload: IAddKitchenStaff = { ...checkPayload };

    const userId = payload.Email;
    const kId = payload.KitchenId;

    var isUserExist = await FirstOrDefault(kTab, "Id", kId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }
    // console.log(userId);
    var isUserExist = await FirstOrDefault(kstaffTab, dbEmail, userId);
    if (isUserExist != null) {
      const error = Message(400, AlreadyExistResponse("Staff"));
      return res.status(400).json(error);
    }
    const hash = await bcrypt.hash(payload.Password, 10);
    payload.Password = hash;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, kstaffTab, vcode);
    payload.VerificationCode = genCode;
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    payload.ExpiresAt = currentTime;

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "kitchenreg",
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
    const response = await AddToDB(kstaffTab, payload);
    const success = Message(200, CreateSuccess, response);
    return res.status(200).json(success);

    // console.log(payload);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const deleteKitchenStaff = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.email.toString();
    const isKitchenExist = await FirstOrDefault(kstaffTab, dbEmail, email);

    if (isKitchenExist == null) {
      const error = Message(400, NotFoundResponse("Staff"));
      res.status(400).json(error);
    } else {
      await Remove(kTab, dbId, email);
      res.status(200).json(DeletedResponse("Staff", email));
    }
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const updateKitchenStaff = async (req: Request, res: Response) => {
  try {
    const email = req.query.email.toString();
    const checkPayload: IKitchenUpdateStaff = req.body;

    const emptyFields = Validation(checkPayload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    const isKitchenExist = await FirstOrDefault(kstaffTab, dbEmail, email);
    if (isKitchenExist == null) {
      const error = Message(400, NotFoundResponse("Staff"));
      return res.status(400).json(error);
    }
    delete checkPayload.Email;

    compareAndUpdateProperties(checkPayload, isKitchenExist);
    const update = await Update(kstaffTab, dbEmail, email, isKitchenExist);
    const response = Message(200, UpdateSuccess, update);

    return res.status(200).json(response);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    res.status(500).json(errMessage);
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const payload: IKitchenLogin = req.body;
    const userId = payload.Email;
    // console.log(userId);
    var checkKitchen = await FirstOrDefault(kTab, dbId, userId);
    var checkstaff = await FirstOrDefault(kstaffTab, dbEmail, userId);

    if (checkKitchen === null && checkstaff === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    var isUserExist = checkKitchen != null ? checkKitchen : checkstaff;
    if (isUserExist.IsVerifiedEmail === false) {
      const error = Message(403, UnverifiedEmail);
      return res.status(403).json(error);
    }

    var userPassword = isUserExist.Password;
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

export const resendVerifyEmail = async (
  producer: Producer,
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.email.toString();
    console.log("Email: ", email);
    var checkKitchen = await FirstOrDefault(kTab, dbId, email);
    var checkstaff = await FirstOrDefault(kstaffTab, dbEmail, email);

    if (checkKitchen === null && checkstaff === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    var isUserExist = checkKitchen != null ? checkKitchen : checkstaff;
    const dbTab = checkKitchen != null ? kTab : kstaffTab;
    const dbParam = checkKitchen != null ? dbId : dbEmail;
    const lastName =
      checkKitchen != null ? isUserExist.ManagerLastName : isUserExist.LastName;
    const vcode = "VerificationCode";
    const genCode = await CryptoGenSixDigitNum(6, dbTab, vcode);
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);

    const payload = { ExpiresAt: currentTime, VerificationCode: genCode };
    await Update(dbTab, dbParam, email, payload);

    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "kitchentreg",
      Type: "Email verification",
      Name: lastName,
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
    const err = Message(500, InternalError);
    return res.status(500).json(err);
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
      dbParam === dbId ? { Password: hash } : { AdminPassword: hash };
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

export const getKitchenOrdersByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.query.Email.toString();

    var isUserExist = await FirstOrDefault(kTab, dbId, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }
    const udbId = isUserExist.Id;
    const aQords = await GetAllById(aOrdTab, dbkId, udbId);
    let newAQorders: IGetKitchenOrdersDto = {
      KitchenId: aQords.at(0).KitchenId,
      Orders: [],
    };

    const odbId = "OrderId";
    for (let index = 0; index < aQords.length; index++) {
      let eOrders = aQords[index];
      const oid = eOrders.OrderId;
      delete eOrders.CreatedAt;
      // delete eOrders.UpdatedAt;
      delete eOrders.KitchenId;
      let order: IGetOrdersDto = { ...eOrders };
      const orders = await GetAllById(ordTab, odbId, oid);
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
