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

// ///////////////////////////////////////////////////////////////////////////////////////

const bodyParser = require('body-parser');
router.use(bodyParser.json());


const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
aws.config.update({
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    region: 'us-west-1'
});
const s3 = new aws.S3();
var upload = multer({
  storage: multerS3({
      s3: s3,
      bucket: 'a2uploads',
      key: function (req, file, cb) {
          console.log('file=======================================',file);
          cb(null, file.originalname); //use Date.now() for unique file keys
      }
  })
});
///-image format is not correct BINARY OR URL
///-localfile url is passed to server and doesn't hav access to the url
///-url sites sits in the



router.post("/",upload.single('upload'), async function (req, res, next) {
  try {

    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');

    console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',req.file);

    console.log('--------------------------------');
    console.log('--------------------------------');
    console.log('--------------------------------');


    const validator = jsonschema.validate(req.body, postNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    
    const newPost = await Post.create(req.body);
    return res.status(201).json({ newPost });
  } catch (err) {
    return next(err);
  }
});


///////////////////////////////////////////////////////////////////////////////////////


// router.post("/",upload.single('file') ,async function (req, res, next) {
//   try {

//     console.log('================================');
//     console.log('================================');
//     console.log('================================');

//     console.log('reqbodyfile=====================',req.file);

//     console.log('================================');
//     console.log('================================');
//     console.log('================================');

//     const validator = jsonschema.validate(req.body, postNewSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }
    
//     const newPost = await Post.create(req.body);
//     return res.status(201).json({ newPost });
//   } catch (err) {
//     return next(err);
//   }
// });

//////////////////////////////////////////////////////////////////////////////////////

// router.post("/", (req, res) => {
//   upload(req, res, (err) => {
//    if(err) {
//      res.status(400).send("Something went wrong!");
//    }
//    res.send(req.file);
//  });
// });

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
