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

///////////////////////////////////////////////////////////////////

var multer = require('multer');
var AWS = require('aws-sdk');

var accessKeyId =  process.env.S3_ACCESS_KEY_ID;
var secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

var s3 = new AWS.S3();

app.use(multer({ // https://github.com/expressjs/multer
  dest: './', 
  limits : { fileSize:100000 },
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase();
  },
  onFileUploadData: function (file, data, req, res) {
    // file : { fieldname, originalname, name, encoding, mimetype, path, extension, size, truncated, buffer }
    var params = {
      Bucket: 'a2uploads',
      Key: file.name,
      Body: data
    };

    s3.putObject(params, function (perr, pres) {
      if (perr) {
        console.log("Error uploading data: ", perr);
      } else {
        console.log("Successfully uploaded data to myBucket/myKey");
      }
    });
  }
}));

///////////////////////////////////////////////////////////////////


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



module.exports = app;
