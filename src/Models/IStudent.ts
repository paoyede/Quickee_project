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
