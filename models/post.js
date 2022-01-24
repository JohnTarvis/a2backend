"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for posts. */

class Post {
  
  /**       -=Create a new post=-
   * this post will have 
   * id
   * poster_id - hidden from the public
   * post_date - unique and decided by registrant
   * post_body - body of the post
   * post_subject - subject of the post
   * post_tags - tags used to search for posts
   * admin_post - whether or not it was posted by an admin
   * */ 
  

  static async create({ poster_handle,
                        post_date,
                        post_body,
                        post_subject,
                        post_tags,
                        admin_post,
                        reply_to,
                        image }) {

    const result = await db.query(
          `INSERT INTO posts (poster_handle, 
                              post_date,
                              post_body,
                              post_subject, 
                              post_tags, 
                              admin_post,
                              reply_to,
                              image)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING  poster_handle,
                      post_date,
                      post_body,
                      post_subject,
                      post_tags,
                      admin_post,
                      reply_to,
                      image`,
        [
          poster_handle,
          post_date,
          post_body,
          post_subject,
          post_tags,
          admin_post,
          reply_to,
          image
        ],
    );
    const post = result.rows[0];
    return post;
  }

  /** 
   * find post by selected criteria
   * */


  static async findAll(searchFilters = {}) {
    let query = `SELECT poster_id,
                        poster_handle,
                        post_date,
                        post_body,
                        post_subject,
                        post_tags,
                        admin_post,
                        image,
                        id
                 FROM posts`;
    let whereExpressions = [];
    let queryValues = [];
    for(const filter in searchFilters){
      queryValues.push(`%${searchFilters[filter]}%`);
    }
    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }
    query += " ORDER BY id";
    const postsRes = await db.query(query, queryValues);
    return postsRes.rows;
  }


  ////////////////////////////////////////////////////////////////////////

  static async getWith(searchFilters = {}){
    let query = `SELECT poster_id,
                        poster_handle,
                        post_date,
                        post_body,
                        post_subject,
                        post_tags,
                        admin_post,
                        image,
                        id
                 FROM posts`;

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

    // console.log('filterNames======================',filterNames);
    // console.log('query============================',query);
    // console.log('whereValues======================',whereValues);
    // console.log('whereExpressions=================',whereExpressions);

    const results = await db.query(query,whereValues);
    return results.rows;
    
  }



  static async get(handle) {
    const postRes = await db.query(
          `SELECT poster_id,
                  poster_handle,
                  post_date,
                  post_body,
                  post_subject,
                  post_tags,
                  admin_post,
                  image,
                  id
           FROM posts
           WHERE handle = $1`,
        [handle]);
    const post = postRes.rows[0];
    if (!post) throw new NotFoundError(`No post: ${handle}`);
    post.posts = postsRes.rows;
    // console.log('---------------------------------get');
    return post;
  }


  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM posts
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post: ${handle}`);
  }

  static async removeAll(){
    const query = await db.query('TRUNCATE TABLE posts CASCADE');
  }
}


module.exports = Post;



// static async findAllx(searchFilters = {}) {
//   let query = `SELECT poster_id,
//                       post_date,
//                       post_body,
//                       post_subject,
//                       post_tags,
//                       admin_post,
//                       image,
//                       id
//                FROM posts`;
//   let whereExpressions = [];
//   let queryValues = [];

//   const { poster_id,
//           post_date,
//           post_body,
//           post_subject,
//           post_tags,
//           admin_post} = searchFilters;

//   if (poster_id) {
//     queryValues.push(`%${poster_id}%`);
//   }
//   if (post_date) {
//     queryValues.push(`%${post_date}%`);
//   }
//   if (post_body) {
//     queryValues.push(`%${post_body}%`);
//   }
//   if (post_subject) {
//     queryValues.push(`%${post_subject}%`);
//   }
//   if (post_tags) {
//     queryValues.push(`%${post_tags}%`);
//   }
//   if (admin_post) {
//     queryValues.push(`%${admin_post}%`);
//   }
//   // if (image){
//   //   queryValues.push(`%${image}%`);
//   // }
  
//   if (whereExpressions.length > 0) {
//     query += " WHERE " + whereExpressions.join(" AND ");
//   }

//   // Finalize query and return results

//   query += " ORDER BY id";
//   const postsRes = await db.query(query, queryValues);
//   return postsRes.rows;
// }




  /** Given a post id, return data about post.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  // const result = await db.query(
  //   `INSERT INTO posts
  //    (poster_id, post_date, post_body, post_subject, post_tags, admin_post)
  //    VALUES ($1, $2, $3, $4, $5, $6)
  //    RETURNING poster_id,post_date,post_body,post_subject,post_tags,admin_post`,

  // static async get(handle) {
  //   const postRes = await db.query(
  //         `SELECT poster_id,
  //                 poster_handle,
  //                 post_date,
  //                 post_body,
  //                 post_subject,
  //                 post_tags,
  //                 admin_post,
  //                 image,
  //                 id
  //          FROM posts
  //          WHERE handle = $1`,
  //       [handle]);
  //   const post = postRes.rows[0];
  //   if (!post) throw new NotFoundError(`No post: ${handle}`);
  //   const postsRes = await db.query(
  //         `SELECT id, 
  //                 poster_id, 
  //                 poster_handle, 
  //                 post_body, 
  //                 post_subject, 
  //                 post_tags, 
  //                 post_date, 
  //                 admin_post,
  //                 image,
  //          FROM posts
  //          WHERE poster_handle = $1
  //          ORDER BY id`,
  //       [handle],
  //   );
  //   post.posts = postsRes.rows;
  //   return post;
  // }