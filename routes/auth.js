"use strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");

const Anon = require("../models/anon");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const anonAuthSchema = require("../schemas/anonAuth.json");
const anonRegisterSchema = require("../schemas/anonRegister.json");
const { BadRequestError } = require("../expressError");


function getClientAddress(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0] 
  || req.connection.remoteAddress;
};

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */


router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, anonAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { handle, password } = req.body;
    const anon = await Anon.authenticate(handle, password);
    const token = createToken(anon);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /auth/register:   { anon } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {

  const regData = {
    ip:req.ip,
    password:req.body.password,
    is_admin:false,
    handle:req.body.handle
  }

  try {
    const validator = jsonschema.validate(regData, anonRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const newAnon = await Anon.register(regData);
    const token = createToken(newAnon);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
