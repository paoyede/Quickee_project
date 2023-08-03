import client from "../Database/Postgres";

export const CreateDatabase = (DatabaseName: string) => {
  try {
    client.query(`CREATE DATABASE ${DatabaseName}`);
    return `${DatabaseName} database created`;
  } catch (error) {
    throw error;
  }
};

export const CreateTable = (sql: string) => {
  var tableName = sql.split(" ").at(2);
  try {
    client.query(sql);
    return `${tableName} table created`;
  } catch (error) {
    throw error;
  }
};

export const AlterTable = (sql: string) => {
  var tableName = sql.split(" ").at(2);
  try {
    client.query(sql);
    return `${tableName} table altered`;
  } catch (error) {
    throw error;
  }
};

export const FirstOrDefault = async (
  tableName: string,
  DbParam: string,
  id: string
): Promise<any> => {
  try {
    const fetchByIdQuery = `SELECT * FROM "${tableName}" WHERE "${DbParam}" = $1`;
    const result = await client.query(fetchByIdQuery, [id]);
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    return null;
  } catch (error) {
    // console.log("Detected Error: ", error);
    throw error;
  }
};

export const AddToDB = async (
  tableName: string,
  object: object
): Promise<any> => {
  try {
    const columnNames = Object.keys(object)
      .map((key) => `"${key}"`)
      .join(", ");
    const parameterPlaceholders = Object.keys(object)
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const parameterValues = Object.values(object);

    const insertQuery = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${parameterPlaceholders}) RETURNING *`;
    const saveChanges = await client.query(insertQuery, parameterValues);

    return saveChanges.rows[0];
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in AddToDB:", error);
    throw error;
  }
};

export const GetAll = async (tableName: string): Promise<any> => {
  try {
    const fetchAllQuery = `SELECT * FROM "${tableName}"`;
    const result = await client.query(fetchAllQuery);

    if (result.rows.length > 0) {
      return result.rows;
    }
    return null;
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in GetAll:", error);
    // throw error;
  }
};

export const GetAllById = async (
  tableName: string,
  DbParam: string,
  id: any
): Promise<any> => {
  try {
    const fetchByIdQuery = `SELECT * FROM "${tableName}" WHERE "${DbParam}" = $1`;
    const result = await client.query(fetchByIdQuery, [id]);

    if (result.rows.length > 0) {
      return result.rows;
    }
    return null;
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in GetAllById:", error);
    throw error;
  }
};

export const Update = async (
  tableName: string,
  DbParam: string,
  Id: any,
  object: object
): Promise<any> => {
  try {
    const paramPlaceholders = Object.keys(object)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");
    const paramValues = Object.values(object);

    const updateQuery = `UPDATE "${tableName}" SET "${paramPlaceholders}" WHERE "${DbParam}" = $${
      paramValues.length + 1
    } RETURNING *`;

    const saveChanges = await client.query(updateQuery, [...paramValues, Id]);

    return saveChanges.rows[0];
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in Update:", error);
    throw error;
  }
};

export const Remove = async (
  tableName: string,
  DbParam: string,
  Id: any
): Promise<any> => {
  try {
    const deleteQuery = `DELETE FROM "${tableName}" WHERE "${DbParam}" = $1`;

    await client.query(deleteQuery, [Id]);

    return null;
  } catch (error) {
    // Handle the error appropriately
    console.error("Error in Remove:", error);
    throw error;
  }
};
