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
