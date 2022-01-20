"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Tag = require("../models/tag");
const tagNewSchema = require("../schemas/tagNew.json");
const tagSearchSchema = require("../schemas/tagSearch.json");

// const postUpdateSchema = require("../schemas/postUpdate.json");
// const postSearchSchema = require("../schemas/postSearch.json");

const router = express.Router({ mergeParams: true });

router.get("/", async function (req, res, next) {
  const q = req.query;

  // console.log('req query q=================================',q);

  try {
    const validator = jsonschema.validate(q, tagSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // const posts = await Post.findAll(q);
    const tags = await Tag.get(q);

    return res.json({ tags });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, tagNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
      const newtag = await Tag.create(req.body);
      return res.status(201).json({ newtag });
    } catch (err) {
      ///-TODO-add to searches if already exists
      console.log('ERRORS ',err);
      return next(err);
    }
});

router.get("/:tag", async function (req, res, next) {
  try {
    const tag = await Tag.get(req.params.tag);
    return res.json({ tag });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, tagUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const tag = await Tag.update(req.params.id, req.body);
    return res.json({ tag });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Tag.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:tag", ensureAdmin, async function (req, res, next) {
  try {
    const valitator = jsonschema.valtagate(req.body, tagUpdateSchema);
    if (!valitator.valtag) {
      const errs = valitator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const tag = await Tag.update(req.params.tag, req.body);
    return res.json({ tag });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:tag", ensureAdmin, async function (req, res, next) {
  try {
    await Tag.remove(req.params.tag);
    return res.json({ deleted: +req.params.tag });
  } catch (err) {
    return next(err);
  }
});
  
module.exports = router;