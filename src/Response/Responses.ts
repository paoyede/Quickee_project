export const VerifyEmail =
  "Code to verify email has been sent to your email address";
export const UnverifiedEmail = "Unverified email";
export const WrongPassword = "Incorrect Password";
export const LoginSuccess = "login success";
export const NullFields = "Please fill all entries";
export const InternalError = "Internal Server Error";
export const CreateSuccess = "created successfully";
export const NotFoundResponse = (name: string) => {
  return `${name} not found`;
};
export const AlreadyExistResponse = (name: string) => {
  return `${name} already exist`;
};
export const InvalidEmail = "Invalid email";
export const WrongOtp = "Wrong OTP";
export const ExpiredOTP = "Expired OTP";
export const ResetLinkSent =
  "OTP to reset password has been sent to your email";
export const DeletedResponse = (delName: string, id: any) => {
  return `${delName} with id ${id} has been deleted!`;
};
export const UpdateSuccess = "updated succesfully";
export const FetchedSuccess = "fetched succesfully";
export const pushNotifySent = "Successfully sent push notification message";
export const PhonePinSent =
  "Phone verification pin has been sent to your phone";
export const EmailPinSent =
  "Email verification pin has been sent to your email";
