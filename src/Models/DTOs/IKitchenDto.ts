export interface IKitchenCreateDto {
  KitchenName: string;
  KitchenEmail: string;
  ManagerFirstName: string;
  ManagerLastName: string;
  ManagerPhone: number;
  ManagerEmail: string;
  Password: string;
  IsVerifiedEmail: boolean;
  University: string;
  AccountNumber: number;
  BankCode: number;
  AccountName: string;
  BankName: string;
  VerificationCode: string;
  ExpiresAt: Date;
  Role: string;
}

export const createkitchenKeys: string[] = [
  "KitchenName",
  "KitchenEmail",
  "ManagerFirstName",
  "ManagerLastName",
  "ManagerPhone",
  "ManagerEmail",
  "Password",
  "University",
  "AccountNumber",
  "BankCode",
  "AccountName",
  "BankName",
];

export const validateBankKeys: string[] = [
  "BankCode",
  "AccountNumber",
  "ShouldProceed",
];

export const noEditKitchenKeys: string[] = [
  "KitchenEmail",
  "ManagerEmail",
  "KitchenImage",
  "Password",
  "University",
  "AccountNumber",
  "AccountName",
  "BankName",
];

export const addKitStaffKeys: string[] = [
  "KitchenId",
  "FirstName",
  "LastName",
  "Email",
  "Password",
  "Phone",
  "University",
  "Role",
];

export const updateKitStaffKeys: string[] = [
  "FirstName",
  "LastName",
  "Password",
  "Phone",
  "University",
];

export interface IKitchenUpdateDto {
  Manager?: string;
  ManagerPhone?: number;
  AdminEmail?: string;
  University?: string;
}

export interface IKitchenLoginDto {
  Email: string;
  Password: string;
  IsAdmin: boolean;
}

export interface CreateFoodMenuDto {
  KitchenId: string;
  FoodName: string;
  Category: string;
  Class: string;
  Price: number;
  Status: string;
}

export const foodmenukeys = [
  "KitchenId",
  "FoodName",
  "Category",
  "Class",
  "Price",
  "TotalQuantity",
  "Status",
];

export interface UpdateFoodMenuDto {
  FoodName?: string;
  Category?: string;
  Class?: string;
  Price?: number;
  Status?: string;
}

export interface IGetKitchenOrdersDto {
  KitchenId: string;
  Orders: IGetOrdersDto[];
}

export interface IGetStudentOrdersDto {
  UserId: string;
  Orders: IGetOrdersDto[];
}

export interface IGetOrdersDto {
  OrderId: string;
  UserId: string;
  TrxRef: string;
  IsPaid: boolean;
  Description: string;
  TotalAmount: number;
  CreatedAt: string;
  UpdatedAt: string;
  Items: IGetItemsDto[];
}

export interface IGetItemsDto {
  Id: string;
  OrderId: string;
  Name: string;
  Price: number;
  Scoops: number;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface IReview {
  KitchenId: string;
  UserId: string;
  Reviewer: string;
  Review: string;
  Tag: string;
  AgreeCount: number;
  DisagreeCount: number;
  WhoLiked: string[];
  WhoDisliked: string[];
}

export interface IUpdateReview {
  Id: string;
  UserId: string;
  Review: string;
  WhoLiked: string[];
  WhoDisliked: string[];
}

export const updateReviewkeys = [
  "Id",
  "UserId",
  "Review",
  "WhoLiked",
  "WhoDisliked",
];

export const reviewkeys = ["KitchenId", "UserId", "Reviewer", "Review"];

export interface IFirebaseUserToken {
  FcmToken: string;
  UserId: string;
}

export interface INotifyMessage {
  KitchenId: string;
  UserId: string;
  Title: string;
  Message: string;
}

export const fcmTokenkeys = ["FcmToken", "UserId"];

export interface IAllUserFCMTokens {
  FcmTokens: string[];
}
