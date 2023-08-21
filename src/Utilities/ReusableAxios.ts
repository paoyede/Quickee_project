import Axios from "axios";

export const axiosInstance = (baseUrl: string) =>
  Axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const axiosWithAuth = (token: string, baseUrl: string) =>
  Axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
