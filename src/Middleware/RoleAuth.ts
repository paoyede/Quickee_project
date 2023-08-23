import { ROLE_ARRAY } from "../Data/Role";
import { Request, Response, NextFunction } from "express";
import { FirstOrDefault } from "../Infrastructure/Repository";

interface IUser {
  // Define the properties of your user object
  // For example:
  UserId: string;
  Role: string;
}

interface CustomRequest<T> extends Request {
  user?: T; // Add the user property to the Request type
}

export const authuser = (
  req: CustomRequest<IUser>, // Use the custom Request type
  res: Response<any, Record<string, any>>,
  next: NextFunction
): void => {
  if (req.user == null) {
    res.status(403).json("You need to sign in");
    return;
  }
  next();
};

export const authrole = (start = 0, end = 2) => {
  return async (
    req: CustomRequest<IUser>, // Use the custom Request type
    res: Response<any, Record<string, any>>,
    next: NextFunction
  ): Promise<void> => {
    const sTab = "SchoolOwner";
    let getUser = await FirstOrDefault(sTab, "Id", req.user.UserId);
    if (getUser == null) {
      await FirstOrDefault("Staff", "Id", req.user.UserId);
    }
    if (
      getUser == null ||
      !ROLE_ARRAY.slice(start, end).includes(getUser.Role)
    ) {
      res.status(403).json("Role not allowed");
      return;
    }
    next();
  };
};
