import { jwtaccesssecret } from "../Utilities/Configs";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IUser {
  // Define the properties of your user object
  // For example:
  Email: string;
  UserId: string;
}

interface CustomRequest<T> extends Request {
  user?: T; // Add the user property to the Request type
}

export const authtoken = (
  req: CustomRequest<IUser>, // Use the custom Request type
  res: Response<any, Record<string, any>>,
  next: NextFunction
): any => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  // Bearer TOKEN
  // console.log(token);

  if (token == null) {
    return res.status(401).json("Unauthorized");
  }

  verify(token, jwtaccesssecret, (err, user) => {
    if (err) {
      return res.status(403).json("Forbidden");
    }

    req.user = user as IUser; // Typecast 'user' to IUser
    next();
  });
};
