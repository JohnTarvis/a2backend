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
  


  static async create({ 
    poster_ip,
    poster_handle,
    post_body,
    post_subject,
    post_tags,
    admin_post,
    reply_to,
    image }) {

      // console.log('poster  ip===========================================',poster_ip);
      
      const isBanned = await db.query(
        `SELECT * FROM banned_list WHERE handle = '${poster_handle}' OR ip = '${poster_ip}' `
      );      

      // console.log('isBanned???????????????????????????????????????????????????????',isBanned);

      if(!!isBanned.rows.length != 0){
        console.log('-------------------------------------banned------------------------------------------');
      } else {
        console.log('-------------------------------------NOT banned------------------------------------------');
      }

      const result = await db.query(
        `INSERT INTO posts (
                  poster_handle, 
                  post_body,
                  post_subject, 
                  post_tags, 
                  admin_post,
                  reply_to,
                  image)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING  
          poster_handle,
          post_body,
          post_subject,
          post_tags,
          admin_post,
          reply_to,
          image`,
        [
          poster_handle,
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

////////////////////////////////////////////////////////////////////////FIND ALL

  static async findAll(searchFilters = {}) {
    console.log('FINDALL==============================================');
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

  ////////////////////////////////////////////////////////////////////////Get Replies

  static async getReplies(searchFilters = {}) {
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

  ////////////////////////////////////////////////////////////////////////GET WITH

  static async getWith(searchFilters = {}){
    let query = `SELECT poster_id,
                        poster_handle,
                        post_date,
                        post_body,
                        post_subject,
                        post_tags,
                        admin_post,
                        image,
                        id,
                        reply_to
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

    const results = await db.query(query,whereValues);
    return results.rows;
    
  }

  ////////

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
    post.posts = postRes.rows;
    return post;
  }

  ////////////////////////////////////////////////////////////////////////REMOVE

  // static async remove(id) {
  //   console.log('post id in post.js==========================================',id);
  //   const result = await db.query(
  //         `DELETE
  //          FROM posts
  //          WHERE id = $1`,
  //       [id]);
  //   const post = result.rows[0];

  //   if (!post) throw new NotFoundError(`No post: ${id}`);
  // }

  static async remove(id) {

    const result = await db.query(
          `DELETE
           FROM posts
           WHERE id = ${id}`);

    const resultReplies = await db.query(
          `DELETE 
           FROM posts
           WHERE reply_to=${id}`);

  }


  static async removeAll(){
    const query = await db.query('TRUNCATE TABLE posts CASCADE');
  }
}


module.exports = Post;

