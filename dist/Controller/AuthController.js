"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const NodeMailer_1 = require("./../Services/Implementations/SendEmail/NodeMailer");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Repository_1 = require("../Infrastructure/Repository");
const Responses_1 = require("../Response/Responses");
const IResponse_1 = require("../Response/IResponse");
const stdTab = "Student";
const dbId = "Email";
const signup = async (req, res) => {
    const payload = req.body;
    try {
        const userId = payload.Email;
        // console.log(userId);
        var isUserExist = await (0, Repository_1.FirstOrDefault)(stdTab, dbId, userId);
        if (isUserExist != null) {
            const error = (0, IResponse_1.Message)(400, Responses_1.UserIsExist);
            res.status(400).json(error);
        }
        else {
            const username = (payload.UserName =
                payload.FirstName + "." + payload.LastName);
            payload.UserName = username;
            const hash = await bcrypt_1.default.hash(payload.Password, 10);
            payload.Password = hash;
            await (0, NodeMailer_1.SendEmailMessage)("nifemiojinni22@gmail.com", "Quickee Food Company", "This is a test");
            const response = await (0, Repository_1.AddToDB)(stdTab, payload);
            const success = (0, IResponse_1.Message)(200, Responses_1.CreateSuccess, response);
            res.status(200).json(success);
        }
        // console.log(payload);
    }
    catch (error) {
        const err = (0, IResponse_1.Message)(500, Responses_1.InternalError);
        res.status(500).json(err);
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    try {
    }
    catch (error) { }
};
exports.signin = signin;
//# sourceMappingURL=AuthController.js.map