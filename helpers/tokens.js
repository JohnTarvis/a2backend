const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from anon data. */

function createToken(anon) {
  // console.log('isadmin-----------------------------',anon.is_admin);
  // console.assert(anon.is_admin !== undefined,
  //     "createToken passed anon without is_admin property");

  let payload = {
    handle: anon.handle,
    is_admin: anon.is_admin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
