export const staffTable =
  `CREATE TABLE "Staff" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "SchoolId" UUID, "FirstName" TEXT, "LastName" TEXT,` +
  ` "Email" TEXT, "SchoolEmail" TEXT, "Password" VARCHAR, "PhoneNumber" BIGINT, "Street" TEXT, "City" TEXT, "State" TEXT, "Country" TEXT,` +
  ` "Subjects" TEXT[], "Rank" TEXT, "Role" TEXT, "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const alterTableQuery = `ALTER TABLE Staff ADD COLUMN "NextOfKin" VARCHAR(50), ADD COLUMN "Age" INT`;

export const schoolTable =
  `CREATE TABLE "SchoolOwner" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "CeoName" TEXT, "Email" TEXT,` +
  `"IsVerifiedEmail" BOOLEAN DEFAULT false, "PhoneNumber" BIGINT, "IsVerifiedPhone" BOOLEAN DEFAULT false, "Password" TEXT, "SchoolName" TEXT,` +
  `"Logo" TEXT, "Street" TEXT, "City" TEXT, "State" TEXT, "Country" TEXT, "CacRegNumber" TEXT, "EstablishedDate" DATE, "NumberOfTeachers" BIGINT,` +
  `"SchoolType" TEXT[], "Motto" TEXT, "Rank" TEXT, "Role" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const refreshTokenTable = `CREATE TABLE "RefreshToken" ("RefreshToken" TEXT)`;

export const studentTable =
  `CREATE TABLE "Student" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "FirstName" TEXT, "LastName" TEXT, "Email" TEXT,` +
  `"Password" VARCHAR, "IsVerifiedEmail" BOOLEAN DEFAULT false, "University" TEXT, "UserName" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const kitchenTable =
  `CREATE TABLE "Kitchen" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "Name" TEXT, "KitchenEmail" TEXT, "KitchenPassword" VARCHAR,` +
  `"Manager" TEXT, "ManagerPhone" BIGINT, "AdminEmail" VARCHAR, "AdminPassword" VARCHAR, "IsVerifiedEmail" BOOLEAN DEFAULT false,` +
  `"University" TEXT, "AccountNumber" BIGINT, "AccountName" TEXT, "BankName" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const MenuTable =
  `CREATE TABLE "KitchenMenu" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "FoodName" TEXT, "Category" TEXT,` +
  `"Varieties" TEXT[], "Price" BIGINT, "ImageUrl" VARCHAR, "Status" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const RevieTable =
  `CREATE TABLE "Review" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "Reviewer" TEXT, "Review" TEXT,` +
  `"AgreeCount" BIGINT, "DisagreeCount" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const ForgotPassword = `CREATE TABLE "ForgotPassword" ("Id" UUID PRIMARY KEY, "ForgotPin" VARCHAR(6))`;
