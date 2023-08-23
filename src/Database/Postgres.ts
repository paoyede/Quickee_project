import { Pool } from "pg";

const client = new Pool({
  user: "postgres",
  password: "QuickeeDb123",
  host: "database-1.cr7kfuwh0rwo.us-east-2.rds.amazonaws.com",
  port: 5432,
  database: "quickee",
  // user: "postgres",
  // password: "Alade1&&&",
  // host: "localhost",
  // port: 5432,
  // database: "quickee",
});

export default client;
