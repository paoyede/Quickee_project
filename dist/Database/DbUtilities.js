"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentTable = exports.refreshTokenTable = exports.schoolTable = exports.alterTableQuery = exports.staffTable = void 0;
exports.staffTable = `CREATE TABLE "Staff" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "SchoolId" UUID, "FirstName" TEXT, "LastName" TEXT,` +
    ` "Email" TEXT, "SchoolEmail" TEXT, "Password" VARCHAR, "PhoneNumber" BIGINT, "Street" TEXT, "City" TEXT, "State" TEXT, "Country" TEXT,` +
    ` "Subjects" TEXT[], "Rank" TEXT, "Role" TEXT, "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
exports.alterTableQuery = `ALTER TABLE Staff ADD COLUMN "NextOfKin" VARCHAR(50), ADD COLUMN "Age" INT`;
exports.schoolTable = `CREATE TABLE "SchoolOwner" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "CeoName" TEXT, "Email" TEXT,` +
    `"IsVerifiedEmail" BOOLEAN DEFAULT false, "PhoneNumber" BIGINT, "IsVerifiedPhone" BOOLEAN DEFAULT false, "Password" TEXT, "SchoolName" TEXT,` +
    `"Logo" TEXT, "Street" TEXT, "City" TEXT, "State" TEXT, "Country" TEXT, "CacRegNumber" TEXT, "EstablishedDate" DATE, "NumberOfTeachers" BIGINT,` +
    `"SchoolType" TEXT[], "Motto" TEXT, "Rank" TEXT, "Role" TEXT,` +
    `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
exports.refreshTokenTable = `CREATE TABLE "RefreshToken" ("RefreshToken" TEXT)`;
exports.studentTable = `CREATE TABLE "Student" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "FirstName" TEXT, "LastName" TEXT, "Email" TEXT,` +
    `"Password" VARCHAR, "IsVerifiedEmail" BOOLEAN DEFAULT false, "University" TEXT, "UserName" TEXT,` +
    `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
//# sourceMappingURL=DbUtilities.js.map