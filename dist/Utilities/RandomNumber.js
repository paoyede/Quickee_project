"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStaffPassword = exports.generateSixDigitNumber = void 0;
const generateSixDigitNumber = () => {
    const min = 100000; // Minimum value (inclusive)
    const max = 999999; // Maximum value (inclusive)
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.generateSixDigitNumber = generateSixDigitNumber;
const generateStaffPassword = (num) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i < num; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
};
exports.generateStaffPassword = generateStaffPassword;
//# sourceMappingURL=RandomNumber.js.map