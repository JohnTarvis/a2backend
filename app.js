"use strict";

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");

const authRoutes = require('./routes/auth');
const anonRoutes = require('./routes/anon');
const postRoutes = require('./routes/post');
const tagRoutes = require('./routes/tag');

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/anon", anonRoutes);
app.use("/post", postRoutes);
app.use( "/tag", tagRoutes);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

////////////////////////////////////////////////////////////////////

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
// aws.config.update({
//     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     accessKeyId: process.env.S3_ACCESS_KEY_ID,
//     region: 'us-west-1'
// });
// const s3 = new aws.S3();

// var upload = multer({
//   storage: multerS3({
//       s3: s3,
//       bucket: 'a2uploads',
//       key: function (req, file, cb) {
//           console.log(file);
//           cb(null, file.originalname); //use Date.now() for unique file keys
//       }
//   })
// });

// app.post("/upload",upload.array('upl',1), async function (req, res, next) {
//   try {
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

////////////////////////////////////////////////////////////////////

module.exports = app;
