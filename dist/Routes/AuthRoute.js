"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AuthController_1 = require("../Controller/AuthController");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/SignUp", AuthController_1.signup);
router.get("/signin", AuthController_1.signin);
exports.default = router;
//# sourceMappingURL=AuthRoute.js.map