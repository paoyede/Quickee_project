"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DbController_1 = require("../Controller/DbController");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/createdb", DbController_1.createDB);
router.get("/createtable", DbController_1.createTable);
router.get("/altertable", DbController_1.alterTable);
exports.default = router;
//# sourceMappingURL=DbRoute.js.map