"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailPinSent = exports.PhonePinSent = exports.FetchedSuccess = exports.UpdateSuccess = exports.StaffDeleted = exports.SchoolDeleted = exports.InvalidEmail = exports.StaffAlreadyExist = exports.StaffNotFound = exports.SchoolNotFound = exports.UserIsExist = exports.CreateSuccess = exports.InternalError = exports.NullFields = exports.LoginSuccess = exports.WrongPassword = exports.userNotFound = void 0;
exports.userNotFound = "User not found";
exports.WrongPassword = "Incorrect Password";
exports.LoginSuccess = "login success";
exports.NullFields = "Please fill all entries";
exports.InternalError = "Internal Server Error";
exports.CreateSuccess = "created successfully";
exports.UserIsExist = "User already exist";
exports.SchoolNotFound = "School not found";
exports.StaffNotFound = "Staff not found";
exports.StaffAlreadyExist = "Staff already exist";
exports.InvalidEmail = "Invalid email";
const SchoolDeleted = (id) => {
    return `School with id ${id} has been deleted!`;
};
exports.SchoolDeleted = SchoolDeleted;
const StaffDeleted = (id) => {
    return `Staff with id ${id} has been deleted!`;
};
exports.StaffDeleted = StaffDeleted;
exports.UpdateSuccess = "updated succesfully";
exports.FetchedSuccess = "fetched succesfully";
exports.PhonePinSent = "Phone verification pin has been sent to your phone";
exports.EmailPinSent = "Email verification pin has been sent to your email";
//# sourceMappingURL=Responses.js.map