export interface IKitchenCreate {
  Name: string;
  KitchenEmail: string;
  KitchenPassword: string;
  Manager: string;
  ManagerPhone: number;
  AdminEmail: string;
  AdminPassword: string;
  University: string;
  AccountNumber: number;
  AccountName: string;
  BankName: string;
  VerificationCode?: string;
  ExpiresAt?: Date;
}

export interface IKitchenUpdate {
  Manager?: string;
  ManagerPhone?: number;
  AdminEmail?: string;
  University?: string;
}

export interface IKitchenLogin {
  Email: string;
  Password: string;
  IsAdmin: boolean;
}

export interface CreateFoodMenu {
  KitchenId: string;
  FoodName: string;
  Category: string;
  Class: string;
  Price: number;
  Status: string;
}

export interface UpdateFoodMenu {
  FoodName?: string;
  Category?: string;
  Class?: string;
  Price?: number;
  Status?: string;
}
