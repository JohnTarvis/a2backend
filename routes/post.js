"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Post = require("../models/post");
const postNewSchema = require("../schemas/postNew.json");
const postUpdateSchema = require("../schemas/postUpdate.json");
const postSearchSchema = require("../schemas/postSearch.json");
const router = express.Router({ mergeParams: true });

//////////////////////////////////////////////////////////////////////////////////////

const {uploadFile,getFileStream} = require('../aws/api');
// const upload = require("../common");
// const fs = require("fs");
// const util = require("util");
// const unlinkFile = util.promisify(fs.unlink);


//////////////////////////////////////////////////////////////////////////////////////GET POST

router.get("/", async function (req, res, next) {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, postSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const posts = await Post.getWith(q);
    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////CREATE POST

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, postNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const result = await uploadFile(req.body.file);
    console.log("S3 response", result);

    const newPost = await Post.create(req.body);
    return res.status(201).json({ newPost });
  } catch (err) {
    return next(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////GET POST BY ID

router.get("/:id", async function (req, res, next) {
  try {
    const post = await Post.get(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////ALTER POST BY ID

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, postUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const post = await Post.update(req.params.id, req.body);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////DELETE POST BY ID

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Post.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

//////////////////////////////////////////////////////////////////////////////////////DELETE ALL POSTS

router.delete("/",async function(req,res,next){
  try{
    await Post.removeAll();
    return res.json({deleted: "...all posts"});
  } catch{
    return next(err);
  }
});


module.exports = router;
