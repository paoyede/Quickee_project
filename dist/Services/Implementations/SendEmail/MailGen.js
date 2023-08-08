"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mail = void 0;
const mailgen_1 = __importDefault(require("mailgen"));
const MailGenerator = new mailgen_1.default({
    theme: "default",
    product: {
        name: "Quickee Food",
        link: "https://quickeefood.netlify.app/",
    },
});
const response = {
    body: {
        name: "Raphael",
        intro: "Your bill has arrived",
        table: {
            data: [
                {
                    item: "Nodemailer Stack Book",
                    description: "A Backend app",
                    price: "$10.99",
                },
            ],
        },
        outro: "See you again",
    },
};
exports.mail = MailGenerator.generate(response);
//# sourceMappingURL=MailGen.js.map