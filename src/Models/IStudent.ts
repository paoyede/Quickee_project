export interface ISignIn {
  UserName: string;
  Password: string;
}

export interface ISignUp {
  FirstName: string;
  LastName: string;
  University: string;
  Password: string;
  Email: string;
  UserName?: string;
}

export interface IUpdatePassword {
  OTP: string;
  NewPassword: string;
}

export interface IAllUsersOrders {
  KitchenId: string;
  UserId: string;
  TrxRef: string;
  IsPaid?: boolean;
  TotalAmount?: number;
  Description?: string;
}

export interface IOrder {
  OrderId?: string;
  KitchenId: string;
  UserId: string;
  Description?: string;
  Items: Item[];
}

interface Item {
  OrderId?: string;
  Name: string;
  Price: number;
  Scoops: number;
}
