import { FirstOrDefault } from "../Infrastructure/Repository";
import crypto from "crypto";

export const RandGenSixDigitNum = async (
  length: number,
  table: string,
  dbParam: string
) => {
  const characters = "0123456789";
  const charactersLength = characters.length;
  let reference;

  do {
    reference = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      reference += characters.charAt(randomIndex);
    }
  } while (!(await isReferenceUnique(table, dbParam, reference)));

  return reference;
};

export const CryptoGenSixDigitNum = async (
  length: number,
  table: string,
  dbParam: string
) => {
  const characters = "0123456789";
  const charactersLength = characters.length;
  let reference;

  do {
    reference = "";
    for (let i = 0; i < length; i++) {
      const randomBytes = crypto.randomBytes(1);
      const randomIndex = randomBytes[0] % charactersLength;
      reference += characters.charAt(randomIndex);
    }
  } while (!(await isReferenceUnique(table, dbParam, reference)));

  return reference;
};

export const RandGenTrxRef = async (
  length: number,
  table: string,
  dbParam: string
) => {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let reference;

  do {
    reference = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      reference += characters.charAt(randomIndex);
    }
  } while (!(await isReferenceUnique(table, dbParam, reference)));

  return reference;
};

export const cryptoGenTrxRef = async (
  length: number,
  table: string,
  dbParam: string
) => {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let reference;

  do {
    reference = "";
    for (let i = 0; i < length; i++) {
      const randomBytes = crypto.randomBytes(1);
      const randomIndex = randomBytes[0] % charactersLength;
      reference += characters.charAt(randomIndex);
    }
  } while (!(await isReferenceUnique(table, dbParam, reference)));
  // console.log("my gen ref : ", reference);
  return reference;
};

const isReferenceUnique = async (
  table: string,
  dbParam: string,
  reference: any
) => {
  try {
    // Replace this with your database query to check if the reference exists
    const existingRecord = await FirstOrDefault(table, dbParam, reference);
    // If the record doesn't exist, it's unique

    return !existingRecord;
  } catch (error) {
    // Handle database query errors
    console.error("Error checking uniqueness:", error);
    throw error;
  }
};
