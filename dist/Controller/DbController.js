"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSchools = exports.getSchool = exports.alterTable = exports.createTable = exports.createDB = void 0;
const DbUtilities_1 = require("../Database/DbUtilities");
const Repository_1 = require("../Infrastructure/Repository");
const Responses_1 = require("../Response/Responses");
const IResponse_1 = require("../Response/IResponse");
const schTab = "SchoolOwner";
const dbId = "CacRegNumber";
const createDB = async (req, res) => {
    try {
        const { dbName } = req.params;
        const Db = (0, Repository_1.CreateDatabase)(dbName);
        res.status(200).json(Db);
    }
    catch (error) {
        res.status(400).json("Failed database creation");
    }
};
exports.createDB = createDB;
const createTable = async (req, res) => {
    try {
        const DbTab = (0, Repository_1.CreateTable)(DbUtilities_1.studentTable);
        res.status(200).json(DbTab);
    }
    catch (error) {
        console.log(error);
        res.status(400).json("Failed table creation");
    }
};
exports.createTable = createTable;
const alterTable = async (req, res) => {
    try {
        const DbTab = (0, Repository_1.AlterTable)(DbUtilities_1.alterTableQuery);
        res.status(200).json(DbTab);
    }
    catch (error) {
        res.status(400).json("Failed table alteration");
    }
};
exports.alterTable = alterTable;
const getSchool = async (req, res) => {
    try {
        const { id } = req.params;
        const isSchoolExist = await (0, Repository_1.FirstOrDefault)(schTab, dbId, id);
        if (isSchoolExist == null) {
            const error = (0, IResponse_1.Message)(400, Responses_1.SchoolNotFound);
            res.status(400).json(error);
        }
        else {
            const response = (0, IResponse_1.Message)(200, Responses_1.FetchedSuccess, isSchoolExist);
            res.status(200).json(response);
        }
    }
    catch (error) {
        const errMessage = (0, IResponse_1.Message)(500, Responses_1.InternalError);
        res.status(500).json(errMessage);
    }
};
exports.getSchool = getSchool;
//get all schools
const getAllSchools = async (req, res) => {
    try {
        const schools = await (0, Repository_1.GetAll)(schTab);
        const txt = schools != null ? `${schools.length} ${Responses_1.FetchedSuccess}` : "No records";
        const sucResponse = (0, IResponse_1.Message)(200, txt, schools);
        res.status(200).json(sucResponse);
    }
    catch (error) {
        const errMessage = (0, IResponse_1.Message)(500, Responses_1.InternalError);
        res.status(500).json(errMessage);
    }
};
exports.getAllSchools = getAllSchools;
//# sourceMappingURL=DbController.js.map