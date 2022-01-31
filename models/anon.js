"use strict";

// const db = require("../db");
// const { sqlForPartialUpdate } = require("../helpers/sql");

// const bcrypt = require("bcrypt");


const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");


function bigPrint(msg){
  console.log(`============================================

  ${msg}
  
  ===========================================`);
}

/** Related functions for anons. */

class Anon {
  /**       -=Create a new anon=-
   * this anon will have 
   * id
   * ip - hidden from the public
   * handle - unique and decided by registrant
   * password
   * birth_time
   * is_admin
   * */

  //////////////////////////////////////////////////////////////

   static async authenticate(handle, password) {
    // try to find the user first

    // bigPrint(`handle ${handle} password ${password}`);


    const result = await db.query(
          `SELECT handle,
                  password 
           FROM anons
           WHERE handle = $1`,
        [handle]);

    // console.log('MODELS ANON AUTHENTICATE======================',result.rows[0]);

    const anon = result.rows[0];

    // console.log(anon.blah);

    if (anon) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, anon.password);
      if (isValid === true) {
        delete anon.password;
        return anon;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }
  ////////////////////////////////////////////////////////////////


  static async register({ handle, ip, birth_time, is_admin, password }) {

    const duplicateHandleCheck = await db.query(
          `SELECT handle
          FROM anons
          WHERE handle = $1`,
    [handle]);

    const duplicateIpCheck = await db.query(
          `SELECT ip 
          FROM anons
          WHERE ip = $1`,
    [ip]);
    
    if (duplicateHandleCheck.rows[0])
      throw new BadRequestError(`Handle already in use: ${handle}`);

    if (duplicateIpCheck.rows.length > 3)
      throw new BadRequestError(`Limit 3 accounts per IP.`);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const current_time = new Date();

    const result = await db.query(
          `INSERT INTO anons
           (handle, ip, birth_time, is_admin,password)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle,ip,birth_time,is_admin,password`,
        [
          handle,
          ip,
          current_time,
          is_admin,
          hashedPassword
        ],
    );
    const anon = result.rows[0];

    return anon;
  }


  /** 
   * find anon by selected criteria
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT id,
                        ip,
                        handle,
                        birth_time,
                 FROM anons`;
    let whereExpressions = [];
    let queryValues = [];

    const { id, ip, handle, birth_time } = searchFilters;

    if (id) {
      queryValues.push(`%${id}%`);
    }
    if (ip) {
      queryValues.push(`%${ip}%`);
    }
    if (handle) {
      queryValues.push(`%${handle}%`);
    }
    if (birth_time) {
      queryValues.push(`%${birth_time}%`);
    }
    
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY id";
    const anonsRes = await db.query(query, queryValues);
    return anonsRes.rows;
  }

  /** Given a anon handle, return data about anon.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const anonRes = await db.query(
          `SELECT handle,
                  ip,
                  birth_time
           FROM anons
           WHERE handle = $1`,
        [handle]);
    const anon = anonRes.rows[0];
    // console.log('==============================anon: ',anon);
    if (!anon){
      throw new NotFoundError(`No anon: ${handle}`);
    } 
    const postsRes = await db.query(
          `SELECT id, 
                  poster_handle, 
                  post_body, 
                  post_subject, 
                  post_tags, 
                  post_date, 
                  admin_post
           FROM posts
           WHERE poster_handle = $1
           ORDER BY id`,
        [handle],
    );
    anon.posts = postsRes.rows;
    return anon;
  }

  /** Update anon data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        // numEmployees: "num_employees",
        // logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE anons 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle,
                                id, 
                                ip, 
                                birth_time"`;
    const result = await db.query(querySql, [...values, handle]);
    const anon = result.rows[0];

    if (!anon) throw new NotFoundError(`No anon: ${handle}`);

    return anon;
  }

  /** Delete given anon from database; returns undefined.
   *
   * Throws NotFoundError if anon not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM anons
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const anon = result.rows[0];

    if (!anon) throw new NotFoundError(`No anon: ${handle}`);
  }

  static async removeAll(){
    const query = await db.query('TRUNCATE TABLE anons CASCADE');
  }
}


module.exports = Anon;

