export interface ISignInDto {
  UserName: string;
  Password: string;
}

export interface ISignUpDto {
  FirstName: string;
  LastName: string;
  University: string;
  Password: string;
  Email: string;
}

export const studSigninKeys = ["UserName", "Password"];

export const studSignupKeys: string[] = [
  "FirstName",
  "LastName",
  "University",
  "Password",
  "Email",
];

export interface IResetPasswordDto {
  Email: string;
  OTP: string;
  NewPassword: string;
}

export interface IVerifyEmailDto {
  EmailOTP: string;
  Email: string;
}

export interface IAllUsersOrdersDto {
  KitchenId: string;
  UserId: string;
  TrxRef: string;
  IsPaid?: boolean;
  TotalAmount?: number;
  Description?: string;
}

export interface IOrderDto {
  KitchenId: string;
  UserId?: string;
  Description?: string;
  Items: ItemDto[];
}

export interface IQuickOrderDto {
  KitchenId: string;
  UserId?: string;
  OrderName: string;
  Description: string;
  Items: ItemDto[];
}
export interface IUpdateQuickOrderDto {
  KitchenId: string;
  UserId?: string;
  OrderId: string;
  OrderName: string;
  Description: string;
  Items: UpdateItemDto[];
}

export interface IAllQuickOrdersDto {
  KitchenId: string;
  UserId: string;
  OrderName: string;
  TotalAmount: number;
  Description: string;
}

export const orderKeys = ["KitchenId", "Description", "Items"];
export const qorderKeys = ["KitchenId", "OrderName", "Description", "Items"];
export const updateQOrderKeys = [
  "KitchenId",
  "OrderName",
  "Description",
  "Items",
  "OrderId",
];

export interface ItemDto {
  OrderId?: string;
  Name: string;
  Price: number;
  Scoops: number;
}

export interface UpdateItemDto {
  Id: string;
  OrderId: string;
  Name: string;
  Scoops: number;
  Price: number;
  CreatedAt: string;
  UpdatedAt: string;
}
