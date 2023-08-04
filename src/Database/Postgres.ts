import { Pool } from "pg";

const client = new Pool({
  user: "quickee",
  password: "quickeedatabase",
  host: "quickeedb-18.czjkbfe4jxep.us-east-1.rds.amazonaws.com",
  port: 5432,
  database: "quickee",
});

export default client;
