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
app.use(bodyParser.json());


app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



app.use("/auth", authRoutes);
app.use("/anon", anonRoutes);
app.use("/post", postRoutes);
app.use( "/tag", tagRoutes);



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

module.exports = app;
