export interface IKitchenCreate {
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

export interface IAddKitchenStaff {
  KitchenId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  Phone: number;
  IsVerifiedEmail?: boolean;
  University: string;
  VerificationCode?: string;
  ExpiresAt?: Date;
  Role?: string;
}

export interface IKitchenUpdate {
  Manager?: string;
  ManagerPhone?: number;
  AdminEmail?: string;
  University?: string;
}

export interface IKitchenUpdateStaff {
  Email: string;
  FirstName: string;
  LastName: string;
  Password: string;
  Phone: number;
  University: string;
}

export interface IKitchenLogin {
  Email: string;
  Password: string;
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
