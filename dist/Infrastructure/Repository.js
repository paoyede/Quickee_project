"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Remove = exports.Update = exports.GetAllById = exports.GetAll = exports.AddToDB = exports.FirstOrDefault = exports.AlterTable = exports.CreateTable = exports.CreateDatabase = void 0;
const Postgres_1 = __importDefault(require("../Database/Postgres"));
const CreateDatabase = (DatabaseName) => {
    try {
        Postgres_1.default.query(`CREATE DATABASE ${DatabaseName}`);
        return `${DatabaseName} database created`;
    }
    catch (error) {
        throw error;
    }
};
exports.CreateDatabase = CreateDatabase;
const CreateTable = (sql) => {
    var tableName = sql.split(" ").at(2);
    try {
        Postgres_1.default.query(sql);
        return `${tableName} table created`;
    }
    catch (error) {
        throw error;
    }
};
exports.CreateTable = CreateTable;
const AlterTable = (sql) => {
    var tableName = sql.split(" ").at(2);
    try {
        Postgres_1.default.query(sql);
        return `${tableName} table altered`;
    }
    catch (error) {
        throw error;
    }
};
exports.AlterTable = AlterTable;
const FirstOrDefault = async (tableName, DbParam, id) => {
    try {
        const fetchByIdQuery = `SELECT * FROM "${tableName}" WHERE "${DbParam}" = $1`;
        const result = await Postgres_1.default.query(fetchByIdQuery, [id]);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    }
    catch (error) {
        // console.log("Detected Error: ", error);
        throw error;
    }
};
exports.FirstOrDefault = FirstOrDefault;
const AddToDB = async (tableName, object) => {
    try {
        const columnNames = Object.keys(object)
            .map((key) => `"${key}"`)
            .join(", ");
        const parameterPlaceholders = Object.keys(object)
            .map((_, index) => `$${index + 1}`)
            .join(", ");
        const parameterValues = Object.values(object);
        const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${parameterPlaceholders}) RETURNING *`;
        const saveChanges = await Postgres_1.default.query(insertQuery, parameterValues);
        return saveChanges.rows[0];
    }
    catch (error) {
        // Handle the error appropriately
        console.error("Error in AddToDB:", error);
        throw error;
    }
};
exports.AddToDB = AddToDB;
const GetAll = async (tableName) => {
    try {
        const fetchAllQuery = `SELECT * FROM "${tableName}"`;
        const result = await Postgres_1.default.query(fetchAllQuery);
        if (result.rows.length > 0) {
            return result.rows;
        }
        return null;
    }
    catch (error) {
        // Handle the error appropriately
        console.error("Error in GetAll:", error);
        // throw error;
    }
};
exports.GetAll = GetAll;
const GetAllById = async (tableName, DbParam, id) => {
    try {
        const fetchByIdQuery = `SELECT * FROM "${tableName}" WHERE "${DbParam}" = $1`;
        const result = await Postgres_1.default.query(fetchByIdQuery, [id]);
        if (result.rows.length > 0) {
            return result.rows;
        }
        return null;
    }
    catch (error) {
        // Handle the error appropriately
        console.error("Error in GetAllById:", error);
        throw error;
    }
};
exports.GetAllById = GetAllById;
const Update = async (tableName, DbParam, Id, object) => {
    try {
        const paramPlaceholders = Object.keys(object)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
        const paramValues = Object.values(object);
        const updateQuery = `UPDATE "${tableName}" SET "${paramPlaceholders}" WHERE "${DbParam}" = $${paramValues.length + 1} RETURNING *`;
        const saveChanges = await Postgres_1.default.query(updateQuery, [...paramValues, Id]);
        return saveChanges.rows[0];
    }
    catch (error) {
        // Handle the error appropriately
        console.error("Error in Update:", error);
        throw error;
    }
};
exports.Update = Update;
const Remove = async (tableName, DbParam, Id) => {
    try {
        const deleteQuery = `DELETE FROM "${tableName}" WHERE "${DbParam}" = $1`;
        await Postgres_1.default.query(deleteQuery, [Id]);
        return null;
    }
    catch (error) {
        // Handle the error appropriately
        console.error("Error in Remove:", error);
        throw error;
    }
};
exports.Remove = Remove;
//# sourceMappingURL=Repository.js.map