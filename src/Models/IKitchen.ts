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
  BankCode: number;
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
  Email: string;
  Manager?: string;
  ManagerPhone?: number;
  AdminEmail?: string;
  University?: string;
  KitchenImage?: string;
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

export interface IValidateBank {
  BankCode: string;
  AccountNumber: string;
  ShouldProceed: boolean;
}

export interface IRecipient {
  KitchenId: string;
  BankName: string;
  Type: string;
  AccountName: string;
  AccountNumber: string;
  BankCode: string;
  Currency: string;
  RecipientCode: string;
}

export interface IPaymentDto {
  KitchenId: string;
  UserId: string;
  OrderId: string;
  TrxRef: string;
  IsSuccess: boolean;
  Amount: number;
}

export interface ITransferDto {
  source: string;
  amount: number;
  reference: string;
  recipient: string;
  reason: string;
}

export interface ITransferDBDto {
  KitchenId: string;
  OrderId: string;
  Reference: string;
  RecipientCode: string;
  TransferCode?: string;
  Status: string;
}
