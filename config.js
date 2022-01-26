"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// const PORT = +process.env.PORT || 5432;
const PORT = process.env.PORT;

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "anonanon_test"
      : process.env.DATABASE_URL || 
      "postgresql-acute-34242";
      //"anonanon";
}

const AWS_ACCESS_KEY_ID = 'AKIAZSNCDBDQ4GY3ZN5J';
const AWS_SECRET_ACCESS_KEY = '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';

const S3_REGION='us-west-1';
const S3_BUCKET='a2uploads';

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("anonanon Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");



module.exports = {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_REGION,
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};

