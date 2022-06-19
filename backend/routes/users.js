var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var sqlite = require("better-sqlite3");
var bcrypt = require('bcrypt');


/**
 * @openapi
 * /users/user:
 *   get:
 *     description: Requires a valid JWT in query params called token
 *     consumes:
 *       application/json
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns user details
 *       401:
 *         description: Returns message saying token has expired due to invalid JWT token
 */
router.get('/user', async function(req, res, next) {
  var token = req.query.token

  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
      var db = new sqlite('database.db');
      var user = await db.prepare('SELECT * FROM users where id = (?)').get(decoded.payload.user_id);
      return res.json({ username: user.username })
  } else {
    return res.status(401).json({"message": "expired"})
  }

});


/**
 * @openapi
 * /users/login:
 *   post:
 *     description: 'username and password in request body i.e. {username: "josh", password:"hello"}'
 *     consumes:
 *       application/json
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns json web token
 *       400:
 *         description: Returns invalid credentials when wrong credentials provided
 */
router.post('/login', async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  try {
    var db = new sqlite('database.db');
    var user = await db.prepare('SELECT * FROM users where username = (?)').get(username);
    if(user && bcrypt.compareSync(password+"", user.password)) {
      var token = jwt.sign({ user_id: user.id+"", hash: await bcrypt.hashSync(user.id+"", 10) }, "SECRET_KEY", { expiresIn: '7d' })
      return res.json({
        token: token
      })
    } else {
      return res.status(400).json({
        message: "invalid credentials"
      })
    }
  } catch(err) {
    console.log(err)
  }

  res.status(400).json({
    message: "invalid credentials"
  })
});


/**
 * @openapi
 * /users/register:
 *   post:
 *     description: 'username and password in request body i.e. {username: "josh", password:"hello"}'
 *     consumes:
 *       application/json
 *     produces:
 *       application/json
 *     responses:
 *       201:
 *         description: Returns empty request
 *       400:
 *         description: Return user already exists when user already exists in system
 */
router.post('/register', async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  try {
    var db = new sqlite('database.db');
    var users = await db.prepare('SELECT * FROM users WHERE username = (?)').all(username);
    if(users.length) {
      return res.status(400).json({
        message: "user already exists"
      })
    }
    var hash = await bcrypt.hashSync(password+'', 10);
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);
    return res.status(201).json({})
  } catch (err) {
    console.log(err)
  }
  return res.status(400).json({
    message: "an error occured please try again later"
  })
});

module.exports = router;
