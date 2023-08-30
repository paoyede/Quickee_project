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
