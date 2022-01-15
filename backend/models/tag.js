"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");

const bcrypt = require("bcrypt");
const {
  NotFoundError,
  BadRequestError,
} = require("../expressError");

// const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for tags. */

class Tag {

  /**       -=Create a new tag=-
   * this tag will have 
   * id
   * ip - hidden from the public
   * handle - unique and decided by registrant
   * password
   * birth_time
   * is_admin
   * */


/////////////////////////////////////////////////////////////////////

static async create(tag) {
  tag = tag.tag;
  // console.log('IN TAG MODEL attempting to create tag: ',tag)
    const birth_time = new Date();
    const results = await db.query(
            `INSERT INTO tags (tag,birth_time,searches)
            VALUES ($1,$2,$3)
            RETURNING   id,
                        tag,
                        searches,
                        birth_time`,
        [
            tag,
            birth_time,
            0
        ],
    );
    const result = results.rows[0];
    return result;
}

/////////////////////////////////////////////////////////////////////

   static async get(searchFilters = {}){
    let query = `SELECT id,
                        tag,
                        searches,
                        birth_time
                 FROM tags`;

    const whereExpressions = [];
    const whereValues = [];
    const filterNames = Object.keys(searchFilters);
    if (searchFilters){
      for(const filterName of filterNames){
        const whereValue = searchFilters[filterName];
        whereValues.push(`${whereValue}`);
        whereExpressions.push(`${filterName} = $${whereValues.length}`);
      }
      if(whereExpressions.length > 0){
        query += " WHERE " + whereExpressions.join(" AND ");
      }
    }
    query += " ORDER BY id ";
    const results = await db.query(query,whereValues);
    return results.rows;
  }

/////////////////////////////////////////////////////////////////////

  static async update(tag,data) {
    const colNames = Object.keys(data);
    const vals = Object.values(data);
    if (colNames.length === 0) throw new BadRequestError("No data");
    const cols = colNames.map((colName, i) => 
        `"${colName}"=$${i+1}`
    );
    const setCols = cols.join(',');
    const querySql = `UPDATE tags 
                      SET ${setCols} 
                      WHERE tag = ${tag} 
                      RETURNING id,
                                tag, 
                                searches, 
                                birth_time`;
    const results = await db.query(querySql, [...vals]);
    const result = result.rows[0];
    if (!result) throw new NotFoundError(`COULD NOT UPDATE - No tag: ${tag}`);
    return tag;
  }

/////////////////////////////////////////////////////////////////////

  static async remove(tag) {
    const results = await db.query(
          `DELETE
           FROM tags
           WHERE tag = $1
           RETURNING tag`,
        [tag]);
    const result = results.rows[0];
    if (!result) throw new NotFoundError(`COULD NOT DELETE - No tag: ${tag}`);
  }
}


module.exports = Tag;


/////////////////////////////////////////////////////////////////////

