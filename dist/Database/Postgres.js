"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client = new pg_1.Pool({
    user: "postgres",
    password: "QuickeeDb123",
    host: "database-1.cr7kfuwh0rwo.us-east-2.rds.amazonaws.com",
    port: 5432,
    database: "quickee",
});
exports.default = client;
//# sourceMappingURL=Postgres.js.map