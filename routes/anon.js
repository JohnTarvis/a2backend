"use strict";

/** Routes for anons. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureCorrectAnonOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Anon = require("../models/anon");
const { createToken } = require("../helpers/tokens");
const anonNewSchema = require("../schemas/anonNew.json");
const anonUpdateSchema = require("../schemas/anonUpdate.json");
const anonSearchSchema = require("../schemas/anonSearch.json");


const router = express.Router();

// router.get('/test',function(req,res,next){
//   console.log('test in anon');
// });


/** POST / { anon }  => { anon, token }
 *
 * Adds a new anon. This is not the registration endpoint --- instead, this is
 * only for admin anons to add new anons. The new anon being added can be an
 * admin.
 *
 * This returns the newly created anon and an authentication token for them:
 *  {anon: { handle, firstName, lastName, email, is_admin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, anonNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const anon = await Anon.register(req.body);
    const token = createToken(anon);
    return res.status(201).json({ anon, token });
  } catch (err) {
    return next(err);
  }
});


/** GET / => { anons: [ {handle, firstName, lastName, email }, ... ] }
 *
 * Returns list of all anons.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const anons = await Anon.findAll();
    return res.json({ anons });
  } catch (err) {
    return next(err);
  }
});


/** GET /[handle] => { anon }
 *
 * Returns { handle, firstName, lastName, is_admin, jobs }
 *   where jobs is { id, title, companyHandle, companyName, state }
 *
 * Authorization required: admin or same anon-as-:handle
 **/

router.get("/:handle", ensureCorrectAnonOrAdmin, async function (req, res, next) {
  try {

    const anon = await Anon.get(req.params.handle);
    //console.log('=======================================router anon ',anon);    
    
    return res.json({ anon });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[handle] { anon } => { anon }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { handle, firstName, lastName, email, is_admin }
 *
 * Authorization required: admin or same-anon-as-:handle
 **/

router.patch("/:handle", ensureCorrectAnonOrAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, anonUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const anon = await Anon.update(req.params.handle, req.body);
    return res.json({ anon });
  } catch (err) {
    return next(err);
  }
});


/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization required: admin or same-anon-as-:handle
 **/

router.delete("/:handle", ensureCorrectAnonOrAdmin, async function (req, res, next) {
  try {
    await Anon.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});


/* * POST /[handle]/jobs/[id]  { state } => { application }
 *
 * Returns {"applied": jobId}
 *
 * Authorization required: admin or same-anon-as-:handle
 * */

// router.post("/:handle/:post_id", ensureCorrectAnonOrAdmin, async function (req, res, next) {
//   try {
//     const post_id = +req.params.post_id;
//     await anon.applyToJob(req.params.handle, jobId);
//     return res.json({ applied: jobId });
//   } catch (err) {
//     return next(err);
//   }
// });


module.exports = router;
