import { NextFunction, Request, Response } from "express";

export const FilesPayloadExists = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files)
    return res.status(400).json({ status: "error", message: "Missing files" });

  next();
};
