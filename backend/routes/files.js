var uploader = require('../processes/Uploader.js');
var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var fileUpload = require('express-fileupload');
var cors = require('cors');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan  = require('morgan');
var fs = require('fs');
const sqlite = require('better-sqlite3');
 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload({
  createParentPath: true
}));
router.use(cors());
router.use(morgan('dev'));

/**
 * @openapi
 * /files/upload:
 *   post:
 *     description: 'Uploaded file in the body'
 *     consumes:
 *       multipart/form-data
 *     produces:
 *       application/json
 *     responses:
 *       201:
 *         description: Returns success message confirming uploaded file
 *       204:
 *         description: Returns message advising no file received
 *       401:
 *         description: Notifies that passed token has expired
 *       500:
 *         description: Unkown error returned
 */
router.post('/upload', async function (req, res, next) {
  var token = req.query.token;
  var message = "Unknown error";
  var status = 500;
  var response;
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
    if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
      try {
        console.log(decoded)
        if (!req.files) {
          console.log("No file")
          status = 204;
        } else {
          console.log("here")
          console.log(req)
          let comicFile = req.files.comicFile;
          let filetype = comicFile.name.split(".").pop();
          let supported = "cbz"
          if (filetype == supported) {
            let location = './uploads/' + comicFile.name.slice(0, comicFile.name.length -4) + "-" + decoded.payload.user_id + ".zip";
            let filedata = {
              name: comicFile.name,
              location: location,
              size: comicFile.size,
              user: decoded.payload.user_id
            }
            comicFile.mv(location);
  
            response = await uploader.upload(filedata);
            status = response.status;
            message = response.message;
  
          } else {
            console.log("this one")
            message = "Unsupported filetype";
            status = 415
          }
        }
      } catch (err) {
        console.log(err)
      }
    }
  } catch (error) {
      console.log(error)
      message = "Session expired. Please login again";
      status = 401;
  }
  return res.status(status).send(message);
});

/**
 * @openapi
 * /files/save:
 *   get:
 *     description: 'Saved an uploaded file'
 *     consumes:
 *       multipart/form-data
 *     produces:
 *       application/json
 *     responses:
 *       201:
 *         description: Returns success message confirming uploaded file
 *       204:
 *         description: Returns message advising no file received
 *       401:
 *         description: Notifies that passed token has expired
 *       500:
 *         description: Unkown error returned
 */
 router.post('/save', async function (req, res, next) {
  console.log("Params:")
  console.log(req.body.params)
  var token = req.body.params.token;
  var message = "Unknown error";
  var status = 500;
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
    if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
      try {
        status = 200
        uploader.save(req.body.params, decoded.payload.user_id)
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
      console.log(error)
      message = "Session expired. Please login again";
      status = 401;
  }
  return res.status(status).send(message);
});

router.get('/comics', async function(req, res, next) {
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    if (req.query.id) {
      console.log("Checked the comic")
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE id = (?)').all(req.query.id)
      console.log(comics)
      return res.json(comics)
    } else {
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE user_id = (?) ORDER BY publication ASC').all(decoded.payload.user_id)

      return res.json(comics)}
  } else {
    return res.status(401).json({"message": "expired"})
  }

});

module.exports = router;