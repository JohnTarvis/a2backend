"use strict";

/** Routes for posts. */

// const jsonschema = require("jsonschema");

// const express = require("express");
// const { BadRequestError } = require("../expressError");
// const { ensureAdmin } = require("../middleware/auth");
// const Tag = require("../models/tag");
// const tagNewSchema = require("../schemas/tagNew.json");
// const tagSearchSchema = require("../schemas/tagSearch.json");

// const router = express.Router({ mergeParams: true });

///-----------------------------------------------------------------------GET BY SPECIFIED PARAMETERS
router.get("/", async function (req, res, next) {
  const q = req.query;
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

///-----------------------------------------------------------------------CREATE TAG
router.post("/", async function (req, res, next) {
    try {
      console.log('creating tag====================================in tag post');
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


///-----------------------------------------------------------------------GET SPECIFIC TAG BY NAME
router.get("/:tag", async function (req, res, next) {
  try {
    console.log('starting.........................................');
    const tag = await Tag.get(req.params.tag);
    return res.json({ tag });
  } catch (err) {
    return next(err);
  }
});

///-----------------------------------------------------------------------GET SPECIFIC TAG BY ID
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

///-----------------------------------------------------------------------CHANGE SPECIFIC TAG BY ID
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

///-----------------------------------------------------------------------DELETE SPECIFIC TAG BY NAME
router.delete("/:tag", ensureAdmin, async function (req, res, next) {
  try {
    await Tag.remove(req.params.tag);
    return res.json({ deleted: +req.params.tag });
  } catch (err) {
    return next(err);
  }
});

///-----------------------------------------------------------------------DELETE SPECIFIC TAG BY ID
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Tag.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

router.delete("/", async function (req, res, next) {
  try {
    await Tag.removeAll();
    return res.json({ deleted: "...all tags" });
  } catch (err) {
    return next(err);
  }
});

  
module.exports = router;