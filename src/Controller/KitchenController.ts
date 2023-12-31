import { getMessaging } from "firebase-admin/messaging";
import {
  IGetKitchenOrdersDto,
  IGetOrdersDto,
  INotifyMessage,
  addKitStaffKeys,
  noEditKitchenKeys,
  validateBankKeys,
} from "./../Models/DTOs/IKitchenDto";
import {
  CreateFoodMenu,
  IAddKitchenStaff,
  IKitchenCreate,
  IKitchenLogin,
  IKitchenUpdate,
  IKitchenUpdateStaff,
  IRecipient,
  IValidateBank,
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
  pushNotifySent,
} from "../Response/Responses";
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
import { CreateSuccess, InternalError } from "../Response/Responses";
import { Message } from "../Response/IResponse";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../Services/Implementations/JwtService";
import NodeCache from "node-cache";
import {
  CryptoGenSixDigitNum,
  RandGenSixDigitNum,
} from "../Utilities/RandomNumber";
import { IEmailRequest } from "../Models/IEmail";
import Producer from "../Services/Implementations/MessageBroker/Producer";
import { IResetPassword, IVerifyEmail } from "../Models/IStudent";
import {
  CreateFoodMenuDto,
  IKitchenCreateDto,
  createkitchenKeys,
  foodmenukeys,
} from "../Models/DTOs/IKitchenDto";
import {
  PayloadCannotContain,
  Validation,
  compareAndUpdateProperties,
  isValidPayload,
} from "../Utilities/Validations";
import { axiosWithAuth } from "../Utilities/ReusableAxios";
import { paystacksecret } from "../Utilities/Configs";
import {
  createKitchenRecipientCode,
  validateBankAccount,
} from "../Services/Implementations/PayStack";
import {
  Id,
  aOrdTab,
  dbEmail,
  dbId,
  dbkId,
  forgot,
  kTab,
  kmTab,
  kstaffTab,
  notifyTab,
  ordTab,
  recTab,
  revTab,
  rtokTab,
  sentMessageTab,
  uid,
} from "../Data/TableNames";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
// import v from "../../public/"

const axioWith = axiosWithAuth(paystacksecret, "https://api.paystack.co");
const cache = new NodeCache();

const currentTime = new Date();
const iPath = "../../public/Uploads";

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

    delete checkPayload.BankCode;

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
    return res.status(500).json(err);
  }
};

export const kitchenImageUpload = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // const files: { [key: string]: Express.Multer.File } = req.files;
    let FileName: any;
    const files: any = req.files;
    const kitId = req.query.KitchenId.toString();
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    // const unique = await cryptoGenTrxRef(7, kTab, "TrxRef");
    // console.log(files);
    Object.keys(files).forEach((key) => {
      const uuid: string = uuidv4();
      const fileName = uuid + "-" + files[key].name;
      FileName = fileName;
      const filepath = path.join(__dirname, iPath, fileName);
      console.log(filepath);
      // Check if 'mv' exists before calling it
      if (files[key].mv) {
        files[key].mv(filepath, async (err: any) => {
          if (err) {
            return res.status(500).json({ status: "error", message: err });
          }
        });
      } else {
        console.error(`mv method not found for file with key '${key}'`);
      }
    });

    // return res.json({
    //   status: "success",
    //   message: "Uploaded", //Object.keys(files).toString(),
    // });
    const imgName = isKitchenExist.KitchenImage;
    const imgPathToDelete = path.join(__dirname, iPath, imgName);
    if (fs.existsSync(imgPathToDelete)) {
      fs.unlink(imgPathToDelete, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    } else {
      console.log("File does not exist.");
    }
    await Update(kTab, Id, kitId, { KitchenImage: FileName });
    const response = Message(200, "Success upload", "null", {
      ImageUrl: FileName,
    });
    return res.status(200).json(response);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const validateKitchenBank = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    const payload: IValidateBank = req.body;

    if (!isValidPayload(payload, validateBankKeys)) {
      const error = Message(400, "Invalid payload");
      return res.status(400).json(error);
    }

    const emptyFields = Validation(payload);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be null or empty`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    var isUserExist = await FirstOrDefault(kTab, dbId, email);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }
    const dib = isUserExist.Id;
    var checkRecTable = await FirstOrDefault(recTab, dbkId, dib);
    if (checkRecTable != null) {
      const error = Message(400, AlreadyExistResponse("Recipient"));
      return res.status(400).json(error);
    }

    const acNum = payload.AccountNumber;
    const bcode = payload.BankCode;
    let response;
    let validateAccount = await validateBankAccount(acNum, bcode);

    // console.log(validateAccount);

    if (validateAccount.Status === false) {
      const errorMessage = validateAccount.Message;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }
    response = validateAccount;
    const name = validateAccount.data.account_name;
    const recipientPayload = {
      type: "nuban",
      name: name,
      account_number: acNum,
      bank_code: bcode,
      currency: "NGN",
    };

    let createRecipient;
    if (payload.ShouldProceed === true) {
      createRecipient = await createKitchenRecipientCode(recipientPayload);
      if (createRecipient.status === true) {
        const currency = createRecipient.data.currency;
        const type = createRecipient.data.type;
        const bankName = createRecipient.data.details.bank_name;
        const recCode = createRecipient.data.recipient_code;

        const recipient: IRecipient = {
          KitchenId: dib,
          BankName: bankName,
          Type: type,
          AccountName: name,
          AccountNumber: acNum,
          BankCode: bcode,
          Currency: currency,
          RecipientCode: recCode,
        };

        await AddToDB(recTab, recipient);
        response = Message(200, createRecipient.message);
      } else if (createRecipient.status === false) {
        return res.status(200).json(Message(400, "Could not create recipient"));
      }
    }
    return res.status(200).json(response);
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
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

    const uEmail = payload.Email;
    const kId = payload.KitchenId;

    var isKitchenExist = await FirstOrDefault(kTab, "Id", kId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    const queryParams = { ManagerEmail: uEmail, KitchenEmail: uEmail };
    var isManager = await FirstOrDefaultQueryable(kTab, queryParams, "or");
    if (isManager != null) {
      const mdResponse =
        "You are a kitchen manager, please use another email if you want to make yourself a staff";
      const error = Message(400, mdResponse);
      return res.status(400).json(error);
    }

    // console.log(uEmail);
    var isUserExist = await FirstOrDefault(kstaffTab, dbEmail, uEmail);
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
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const deleteKitchenStaff = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const email = req.query.Email.toString();
    const isKitchenExist = await FirstOrDefault(kstaffTab, dbEmail, email);

    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Staff"));
      return res.status(400).json(error);
    }

    await Remove(kstaffTab, dbEmail, email);
    return res.status(200).json(DeletedResponse("Staff", email));
  } catch (error) {
    const errMessage = Message(500, InternalError);
    return res.status(500).json(errMessage);
  }
};

export const updateKitchenStaff = async (req: Request, res: Response) => {
  try {
    const email = req.query.Email.toString();
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
    var checkKitchen = await FirstOrDefault(kTab, dbId, payload.Email);
    var checkstaff = await FirstOrDefault(kstaffTab, dbEmail, payload.Email);

    if (checkKitchen === null && checkstaff === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    var isUserExist = checkKitchen != null ? checkKitchen : checkstaff;
    if (isUserExist.VerificationCode != payload.EmailOTP) {
      const error = Message(400, WrongOtp);
      return res.status(400).json(error);
    }

    if (isUserExist.ExpiresAt < new Date()) {
      const error = Message(400, ExpiredOTP);
      return res.status(400).json(error);
    }

    const updateEmail = { UpdatedAt: new Date(), IsVerifiedEmail: true };
    const tab = checkKitchen != null ? kTab : kstaffTab;
    const dbParam = checkKitchen != null ? dbId : dbEmail;
    await Update(tab, dbParam, payload.Email, updateEmail);

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
      EmailTemplate: "kitchenreg",
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
    const email = req.query.Email.toString();
    var checkKitchen = await FirstOrDefault(kTab, dbId, email);
    var checkstaff = await FirstOrDefault(kstaffTab, dbEmail, email);

    if (checkKitchen === null && checkstaff === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const forgotDigit = await RandGenSixDigitNum(6, forgot, "ForgotPin");
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 5);
    const payload = {
      UserEmail: email,
      ForgotPin: forgotDigit,
      ExpiresAt: currentTime,
    };

    var checkForgot = await FirstOrDefault(forgot, "UserEmail", email);
    if (checkForgot === null) {
      await AddToDB(forgot, payload);
    } else {
      // delete payload.Id;
      await Update(forgot, "UserEmail", email, payload);
    }

    const lastName =
      checkKitchen != null ? checkKitchen.ManagerLastName : checkstaff.LastName;
    const rabbitmqPayload: IEmailRequest = {
      EmailTemplate: "forgotpassword",
      Type: "Reset password",
      Name: lastName,
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

    var checkKitchen = await FirstOrDefault(kTab, dbId, userId);
    var checkstaff = await FirstOrDefault(kstaffTab, dbEmail, userId);

    if (checkKitchen === null && checkstaff === null) {
      const error = Message(400, NotFoundResponse("User"));
      return res.status(400).json(error);
    }

    const dbTab = checkKitchen != null ? kTab : kstaffTab;
    const dbParam = checkKitchen != null ? dbId : dbEmail;

    const newPassword = { Password: hash };
    await Update(dbTab, dbParam, userId, newPassword);
    const success = Message(200, UpdateSuccess);
    return res.status(200).json(success);
  } catch (error) {
    const errMessage = Message(500, InternalError);
    return res.status(500).json(errMessage);
  }
};

export const updateKitchen = async (req: Request, res: Response) => {
  try {
    const email = req.query.Email.toString();
    const editedKitchen: IKitchenUpdate = req.body;
    const isKitchenExist = await FirstOrDefault(kTab, dbId, email);
    if (isKitchenExist == null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    const emptyFields = PayloadCannotContain(editedKitchen, noEditKitchenKeys);
    if (emptyFields.length > 0) {
      const errorMessage = `${emptyFields.join(", ")} cannot be changed`;
      const error = Message(400, errorMessage);
      return res.status(400).json(error);
    }

    delete editedKitchen.Email;

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
    const email = req.query.Email.toString();
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
    // var isFoodExist = await FirstOrDefault(kmTab, dbkId, kId);
    const queryParams = { KitchenId: kId2, FoodName: kId };
    var isFoodExist = await FirstOrDefaultQueryable(kmTab, queryParams, "and");

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
): Promise<any> => {
  try {
    const payload: UpdateFoodMenu = req.body;
    const menuId = req.query.MenuId.toString();
    var isFoodExist = await FirstOrDefault(kmTab, "Id", menuId);
    if (isFoodExist === null) {
      const error = Message(400, NotFoundResponse("Food"));
      return res.status(400).json(error);
    }

    const kitchenId = isFoodExist.KitchenId;
    var isKitchenExist = await FirstOrDefault(kTab, "Id", kitchenId);
    if (isKitchenExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }
    // producer.publishMessage("This is a test");
    const updatePayload = { ...payload, UpdatedAt: currentTime };
    const response = await Update(kmTab, "Id", menuId, updatePayload);
    const success = Message(200, UpdateSuccess, response);
    return res.status(200).json(success);
  } catch (error) {
    console.log(error);
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

export const deleteFoodMenu = async (req: Request, res: Response) => {
  try {
    const menuId = req.query.MenuId.toString();
    const isKitchenExist = await FirstOrDefault(kmTab, "Id", menuId);

    if (isKitchenExist == null) {
      const error = Message(400, NotFoundResponse("Food menu"));
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
      // delete eOrders.CreatedAt;
      delete eOrders.UpdatedAt;
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

export const getNGBanks = async (req: Request, res: Response) => {
  try {
    const country = "NG";
    const isCached = CheckCacheResource(country, res);
    const path = "/bank?currency=NGN";
    if (!isCached) {
      const response = await axioWith.get(path);
      cache.set(country, response.data, 3600);
      return res.status(200).json(response.data);
    }
  } catch (error) {
    const err = Message(500, InternalError);
    return res.status(500).json(err);
  }
};

const CheckCacheResource = (cacheKey: string, res: Response): boolean => {
  // Check if the data is already cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    // console.log(`cached data for key: ${cacheKey} is available`);
    res.status(200).json(cachedData);
    return true;
  }
  return false;
};

export const getReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const kitId = req.query.KitchenId.toString();

    var reviews = await GetAllById(revTab, dbkId, kitId);

    const success = Message(200, FetchedSuccess, reviews);
    return res.status(200).json(success);

    // console.log(payload);
  } catch (error) {
    const err = Message(500, InternalError);
    res.status(500).json(err);
  }
};

export const sendNotification = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //https://firebase.google.com/docs/cloud-messaging/send-message
    const payload: INotifyMessage = req.body;

    var checkNotify = await FirstOrDefault(notifyTab, uid, payload.UserId);
    if (checkNotify === null) {
      const sms =
        "This user has not enabled his/her device for receiving notification";
      const success = Message(200, sms);
      return res.status(400).json(success);
    }

    var isUserExist = await FirstOrDefault(kTab, Id, payload.KitchenId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }
    const message = {
      notification: {
        title: payload.Title,
        body: payload.Message,
      },
      token: checkNotify.FcmToken,
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    getMessaging()
      .send(message)
      .then(async (response) => {
        // Response is a message ID string.
        const data = {
          UserId: payload.UserId,
          Title: payload.Title,
          Message: payload.Message,
          Sender: isUserExist.KitchenName,
        };
        await AddToDB(sentMessageTab, data);
        console.log("Successfully sent message:", response);
        const success = Message(200, pushNotifySent);
        return res.status(200).json(success);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  } catch (error) {
    // console.log(error);
    const err = Message(500, InternalError, error);
    return res.status(500).json(err);
  }
};

export const notifyToAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    //https://firebase.google.com/docs/cloud-messaging/send-message
    const fetchTokens = await GetAll(notifyTab);
    const allTokens = fetchTokens
      .map((item: any) => item.FcmToken)
      .filter(Boolean);

    const payload: INotifyMessage = req.body;

    // These registration tokens come from the client FCM SDKs
    const message = {
      notification: {
        title: payload.Title,
        body: payload.Message,
      },
      tokens: allTokens,
    };

    var isUserExist = await FirstOrDefault(kTab, Id, payload.KitchenId);
    if (isUserExist === null) {
      const error = Message(400, NotFoundResponse("Kitchen"));
      return res.status(400).json(error);
    }

    getMessaging()
      .sendEachForMulticast(message)
      .then((response) => {
        if (response.failureCount > 0) {
          const failedTokens: any = [];
          response.responses.forEach(async (resp, idx) => {
            if (!resp.success) {
              failedTokens.push(allTokens[idx]);
            } else if (resp.success) {
              const data = {
                UserId: payload.UserId,
                Title: payload.Title,
                Message: payload.Message,
                Sender: isUserExist.KitchenName,
              };
              await AddToDB(sentMessageTab, data);
            }
          });
          console.log("List of tokens that caused failures: " + failedTokens);
        }
        if (response.successCount > 0) {
          const resp = pushNotifySent + ` to ${response.successCount} users`;
          const success = Message(200, resp);
          return res.status(200).json(success);
        }
      });
  } catch (error) {
    // console.log(error);
    const err = Message(500, InternalError, error);
    return res.status(500).json(err);
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
