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

// UPLOADING TO AWS S3
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

//////////////////////////////////////////////////////////////////////////////////////

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'uploads/',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  },{
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});

//////////////////////////////////////////////////////////////////////////////////////

router.get("/", async function (req, res, next) {
  const q = req.query;
  try {
    const validator = jsonschema.validate(q, postSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }


    // const posts = await Post.findAll(q);
    const posts = await Post.getWith(q);

    return res.json({ posts });
  } catch (err) {
    return next(err);
  }
});




router.post("/", async function (req, res, next) {
  try {
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




// app.post('/', upload.single('image'), (req, res, next) => {
//   try {
//     const validator = jsonschema.validate(req.body, postNewSchema);
//     if (!validator.valid) {
//       const errs = validator.errors.map(e => e.stack);
//       throw new BadRequestError(errs);
//     }
//     const post = await Post.create(req.body);
//     post.save(function (err) {
//       if (req.file) {
//         // Upload the images
//         client.upload(req.file.path, {}, function (err, versions, meta) {
//           if (err) { return res.status(400).send({ err: err }) };
  
//           // Pop off the -square and -standard and just use the one URL to grab the image
//           versions.forEach(function (image) {
//             var urlArray = image.url.split('-');
//             urlArray.pop();
//             var url = urlArray.join('-');
//             post.avatarUrl = url;
//             post.save();
//           });
  
//           res.send({ post: post });
//         });
//       } else {
//         res.send({ post: post });
//       }
//     })
//     return res.status(201).json({ post });
//   } catch (err) {
//     return next(err);
//   }
// });



router.get("/:id", async function (req, res, next) {
  try {
    const post = await Post.get(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

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

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Post.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

router.delete("/",async function(req,res,next){
  try{
    await Post.removeAll();
    return res.json({deleted: "...all posts"});
  } catch{
    return next(err);
  }
});


module.exports = router;
