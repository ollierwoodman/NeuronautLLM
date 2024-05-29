import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let db: Database | void;

export async function connect(): Promise<Database | void> {
  if (!process.env.DB_FULL_FILE_PATH) {
    throw new Error("Environment variable 'DB_FULL_FILE_PATH' is not set");
    return undefined;
  }

  if (!db) {
    return open({
      filename: process.env.DB_FULL_FILE_PATH,
      driver: sqlite3.Database,
    })
  }
  
  return db;
}