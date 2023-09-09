import { NextFunction, Request, Response } from "express";
import * as path from "path";

export const FileExtLimiter = (allowedExtArray: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let files: any = req.files;

    if (!Array.isArray(files)) {
      // If it's not an array, convert it to an array with a single element
      files = [files];
    }

    const fileExtensions: any = [];

    try {
      files.forEach((file: any) => {
        if (file && file.name) {
          fileExtensions.push(path.extname(file.name));
        }
      });

      // Are the file extensions allowed?
      const allowed = fileExtensions.every((ext: any) =>
        allowedExtArray.includes(ext)
      );

      if (!allowed) {
        const message = `Upload failed. Only ${allowedExtArray.join(
          ", "
        )} files allowed.`;

        return res.status(422).json({ status: "error", message });
      }

      next();
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error processing file extensions:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal server error" });
    }
  };
};
