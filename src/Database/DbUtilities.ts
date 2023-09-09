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
  `CREATE TABLE "Student" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "FirstName" TEXT NOT NULL, "LastName" TEXT NOT NULL, "Email" TEXT NOT NULL,` +
  `"Password" VARCHAR NOT NULL, "IsVerifiedEmail" BOOLEAN DEFAULT false, "University" TEXT NOT NULL, "UserName" TEXT, "VerificationCode" VARCHAR(6),` +
  `"Role" TEXT, "ExpiresAt" TIMESTAMP, "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const kitchenTable =
  `CREATE TABLE "Kitchen" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenName" TEXT, "KitchenEmail" TEXT, "KitchenImage" VARCHAR,` +
  `"ManagerFirstName" TEXT, "ManagerLastName" TEXT, "ManagerPhone" BIGINT, "ManagerEmail" VARCHAR, "Password" VARCHAR, "IsVerifiedEmail" BOOLEAN DEFAULT false,` +
  `"University" TEXT, "AccountNumber" BIGINT, "AccountName" TEXT, "BankName" TEXT, "VerificationCode" VARCHAR(6), "ExpiresAt" TIMESTAMP,` +
  `"Role" TEXT,"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const kitchenStaffTable =
  `CREATE TABLE "KitchenStaff" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "FirstName" TEXT, "LastName" TEXT, "Email" VARCHAR,` +
  `"Password" VARCHAR, "Phone" BIGINT, "IsVerifiedEmail" BOOLEAN DEFAULT false,` +
  `"University" TEXT, "VerificationCode" VARCHAR(6), "ExpiresAt" TIMESTAMP,` +
  `"Role" TEXT,"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const MenuTable =
  `CREATE TABLE "KitchenMenu" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "FoodName" TEXT, "Category" TEXT,` +
  `"Class" TEXT, "Price" BIGINT, "TotalQuantity" BIGINT, "Status" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const ReviewTable =
  `CREATE TABLE "Review" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "UserId" UUID, "Reviewer" TEXT, "Review" TEXT,` +
  `"Tag" TEXT, "AgreeCount" BIGINT, "DisagreeCount" BIGINT,"WhoLiked" VARCHAR[], "WhoDisliked" VARCHAR[],` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const AllQuickOrders =
  `CREATE TABLE "AllQuickOrders" ("OrderId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "UserId" UUID,` +
  `"OrderName" TEXT, "Description" TEXT, "TotalAmount" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const QuickOrders =
  `CREATE TABLE "QuickOrders" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "OrderId" UUID, "Name" TEXT,` +
  `"Scoops" BIGINT, "Price" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const PaymentsTable =
  `CREATE TABLE "Payments" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "UserId" UUID, "OrderId" TEXT,` +
  `"TrxRef" VARCHAR, "IsSuccess" BOOLEAN DEFAULT false, "Amount" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const RecipientsTable =
  `CREATE TABLE "Recipients" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "BankName" TEXT, "Type" TEXT, "AccountName" TEXT,` +
  `"AccountNumber" TEXT, "BankCode" TEXT, "Currency" TEXT, "RecipientCode" VARCHAR,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const TransfersTable =
  `CREATE TABLE "Transfers" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "OrderId" UUID, "Reference" VARCHAR,` +
  `"RecipientCode" VARCHAR, "TransferCode" VARCHAR, "Status" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const OrdersTable =
  `CREATE TABLE "Orders" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "OrderId" UUID, "Name" TEXT,` +
  `"Scoops" BIGINT, "Price" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const AllOrders =
  `CREATE TABLE "AllUsersOrders" ("OrderId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "KitchenId" UUID, "UserId" UUID,` +
  `"TrxRef" VARCHAR, "IsPaid" BOOLEAN DEFAULT false, "Description" TEXT, "TotalAmount" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const ForgotPassword = `CREATE TABLE "ForgotPassword" ("UserEmail" UUID PRIMARY KEY, "ForgotPin" VARCHAR(6)), "ExpiresAt" TIMESTAMP)`;

export const WalletsTable =
  `CREATE TABLE "Wallets" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "UserId" UUID, "FullName" TEXT,` +
  `"Balance" BIGINT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const DepositsTable =
  `CREATE TABLE "Deposits" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "UserId" UUID,` +
  `"TrxRef" VARCHAR, "Amount" BIGINT, "Status" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const DebitsTable =
  `CREATE TABLE "Debits" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "UserId" UUID,` +
  `"KitchenId" UUID, "OrderId" UUID, "TrxRef" VARCHAR, "Amount" BIGINT, "Status" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const NotificationsTable =
  `CREATE TABLE "Notifications" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "UserId" UUID,` +
  `"FcmToken" VARCHAR,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;

export const SentMessagesTable =
  `CREATE TABLE "SentMessages" ("Id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "UserId" UUID,` +
  `"Title" TEXT, "Message" TEXT, "Sender" TEXT,` +
  `"CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
