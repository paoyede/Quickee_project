"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailMessage = void 0;
const MailGen_1 = require("./MailGen");
const nodemailer_1 = __importDefault(require("nodemailer"));
const TransportParam_1 = __importDefault(require("./TransportParam"));
const mailerConfig = new TransportParam_1.default();
const SendEmailMessage = async (to, subject, message) => {
    let param;
    // param = await mailerConfig.getEtherealTestParam();
    param = mailerConfig.gmailParam;
    // param = mailerConfig.mainParam;
    let transporter = nodemailer_1.default.createTransport(param);
    let mailOptions = {
        from: `ArchIntel <${param.auth.user}>`,
        to: `Alade ${to}`,
        subject: subject,
        text: message,
        html: MailGen_1.mail,
    };
    return transporter
        .sendMail(mailOptions)
        .then((info) => {
        // console.log({ preview: nodemailer.getTestMessageUrl(info) });
        return info;
    })
        .catch((err) => {
        throw err;
    });
};
exports.SendEmailMessage = SendEmailMessage;
//# sourceMappingURL=NodeMailer.js.map