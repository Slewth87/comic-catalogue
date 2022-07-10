var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var sqlite = require("better-sqlite3");
var cookie = require('js-cookie');

router.get('/', async function(req, res, next) {
  var error = req.query.error;
  var token = req.cookies.token
  try {
    await jwt.verify(token, "SECRET_KEY" + req.query.address);
  } catch (error) {
      console.log(error)
      return res.redirect("/users/logout")
  }
});

module.exports = router;