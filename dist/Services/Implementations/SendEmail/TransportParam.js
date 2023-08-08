"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const Configs_1 = require("../../../Utilities/Configs");
class MailerConfig {
    testAccount;
    constructor() {
        this.testAccount = null;
    }
    async initializeTestAccount() {
        this.testAccount = await nodemailer_1.default.createTestAccount();
    }
    // Use createTransport with appropriate configuration
    get gmailParam() {
        return {
            service: "gmail",
            auth: {
                user: Configs_1.gmailEmail,
                pass: Configs_1.gmailPassword,
            },
        };
    }
    get mainParam() {
        return {
            host: Configs_1.orgHost,
            port: Configs_1.orgPort,
            secure: Configs_1.orgPort === 465,
            auth: {
                user: Configs_1.orgEmail,
                pass: Configs_1.orgPassword,
            },
        };
    }
    async getEtherealTestParam() {
        if (!this.testAccount) {
            await this.initializeTestAccount();
        }
        return {
            host: Configs_1.etherealHost,
            port: Configs_1.gmailPort,
            secure: Configs_1.gmailPort === 465,
            auth: {
                user: this.testAccount.user,
                pass: this.testAccount.pass,
            },
        };
    }
}
exports.default = MailerConfig;
//# sourceMappingURL=TransportParam.js.map