export interface IKitchenCreateDto {
  Name: string;
  KitchenEmail: string;
  KitchenPassword: string;
  Manager: string;
  ManagerPhone: number;
  AdminName: string;
  AdminPhone: number;
  AdminEmail: string;
  AdminPassword: string;
  University: string;
  AccountNumber: number;
  AccountName: string;
  BankName: string;
}

export const createkitchenKeys: string[] = [
  "Name",
  "KitchenEmail",
  "KitchenPassword",
  "Manager",
  "ManagerPhone",
  "AdminName",
  "AdminPhone",
  "AdminEmail",
  "AdminPassword",
  "University",
  "AccountNumber",
  "AccountName",
  "BankName",
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
  "Status",
];

export interface UpdateFoodMenuDto {
  FoodName?: string;
  Category?: string;
  Class?: string;
  Price?: number;
  Status?: string;
}
