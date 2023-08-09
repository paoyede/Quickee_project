import { jwtaccesssecret, jwtrefreshsecret } from "../../Utilities/Configs";
import { IJwtPayload } from "../../Models/JwtPayload";
import { sign } from "jsonwebtoken";

export const generateAccessToken = (payload: IJwtPayload): string => {
  const user = { Email: payload.Email, UserId: payload.Id };
  return sign(user, jwtaccesssecret, { expiresIn: "1h" });
};

export const generateRefreshToken = (payload: IJwtPayload): string => {
  const user = { Email: payload.Email, UserId: payload.Id };
  return sign(user, jwtrefreshsecret);
};
