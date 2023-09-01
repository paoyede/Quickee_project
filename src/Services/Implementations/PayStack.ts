import { axiosWithAuth } from "../../Utilities/ReusableAxios";
import { paystacksecret } from "../../Utilities/Configs";

const axioWith = axiosWithAuth(paystacksecret, "https://api.paystack.co");

export const paystackPayment = async (data: any) => {
  try {
    const path = "/transaction/initialize";
    const response = await axioWith.post(path, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const paystackVerifyPayment = async (reference: string) => {
  const encRef = encodeURIComponent(reference);

  try {
    const path = `/transaction/verify/${encRef}`;
    const response = await axioWith.get(path);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const validateBankAccount = async (
  acctNum: string,
  bankCode: string
) => {
  try {
    const path = `/bank/resolve?account_number=${acctNum}&bank_code=${bankCode}`;
    const response = await axioWith.get(path);
    return response.data;
  } catch (error) {
    // throw error;
    return {
      Status: false,
      Message:
        "Could not verify account, kindly check if your account number is correct",
    };
  }
};

export const createKitchenRecipientCode = async (data: any) => {
  try {
    const path = `/transferrecipient`;
    const response = await axioWith.post(path, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const transferToKitchen = async (data: any) => {
  try {
    const path = `/transfer`;
    const response = await axioWith.post(path, data);
    return response.data;
  } catch (error) {
    // throw error;
    return {
      Status: false,
      Message: "Could not transfer to kitchen",
    };
  }
};
