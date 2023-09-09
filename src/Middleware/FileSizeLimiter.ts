import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload"; // Make sure to import 'UploadedFile' if you haven't already

const MB = 5; // 5 MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

export const FileSizeLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const files: Record<string, UploadedFile | UploadedFile[]> = req.files;

  const filesOverLimit: string[] = [];
  // Which files are over the limit?
  Object.keys(files).forEach((key) => {
    const fileOrFiles = files[key];
    if (Array.isArray(fileOrFiles)) {
      // Handle multiple uploaded files with the same field name
      fileOrFiles.forEach((file: UploadedFile) => {
        if (file.size > FILE_SIZE_LIMIT) {
          filesOverLimit.push(file.name);
        }
      });
    } else if (fileOrFiles.size > FILE_SIZE_LIMIT) {
      filesOverLimit.push(fileOrFiles.name);
    }
  });

  if (filesOverLimit.length) {
    const properVerb = filesOverLimit.length > 1 ? "are" : "is";

    const sentence = `Upload failed. ${filesOverLimit.join(
      ", "
    )} ${properVerb} over the file size limit of ${MB} MB.`;

    const message =
      filesOverLimit.length < 3
        ? sentence.replace(",", " and")
        : sentence.replace(/,(?=[^,]*$)/, " and");

    return res.status(413).json({ status: "error", message });
  }

  next();
};
