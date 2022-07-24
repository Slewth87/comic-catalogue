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
        // console.log(decoded)
        if (!req.files) {
          status = 204;
        } else {
          let comicFile = req.files.comicFile;
          let filetype = comicFile.name.split(".").pop();
          let supported = ["cbz","cbr"]
          if (filetype == "cbz") {
            var location = './uploads/' + comicFile.name.slice(0, comicFile.name.length -4) + "-" + decoded.payload.user_id + ".zip";
          } else if (filetype == "cbr") {
            var location = './uploads/' + comicFile.name.slice(0, comicFile.name.length -4) + "-" + decoded.payload.user_id + ".rar";
          }
          if (supported.includes(filetype)) {
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
 router.post('/save', async function (req, res) {
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

/**
 * @openapi
 * /files/comics:
 *   get:
 *     description: 'Retrieve comics'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 */
router.get('/comics', async function(req, res) {
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    if (req.query.search) {
      const search = JSON.parse(req.query.search)
      var column = search.field;
      var keyword = search.keyword;
      if (keyword.includes("'")) {
        let broken = keyword.split("'");
        keyword = "";
        for (let i=0;i < broken.length - 1;i++) {
          keyword = keyword + broken[i] + "''"
        }
        keyword = keyword + broken[broken.length-1]
      }
      if (keyword.includes('"')) {
        let broken = keyword.split('"');
        keyword = "";
        for (let i=0;i < broken.length - 1;i++) {
          keyword = keyword + broken[i] + '""'
        }
        keyword = keyword + broken[broken.length-1]
      }
      if (column === "All") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND ( series LIKE '%" + keyword + "%' OR alternate_series LIKE '%" + keyword + "%' OR writer LIKE '%" + keyword + "%' OR penciller LIKE '%" + keyword + "%' OR inker LIKE '%" + keyword + "%' OR colorist LIKE '%" + keyword + "%' OR letterer LIKE '%" + keyword + "%' OR cover_artist LIKE '%" + keyword + "%' OR editor LIKE '%" + keyword + "%' OR publisher LIKE '%" + keyword + "%' OR imprint LIKE '%" + keyword + "%' OR genre LIKE '%" + keyword + "%' OR characters LIKE '%" + keyword + "%' ) ORDER BY publication ASC"
      } else if (column === "Series") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND ( series LIKE '%" + keyword + "%' OR alternate_series LIKE '%" + keyword + "%' ) ORDER BY publication ASC"
      } else if (column === "Character") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND characters LIKE '%" + keyword + "%' ORDER BY publication ASC"
      } else if (column === "Creator") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND ( writer LIKE '%" + keyword + "%' OR penciller LIKE '%" + keyword + "%' OR inker LIKE '%" + keyword + "%' OR colorist LIKE '%" + keyword + "%' OR letterer LIKE '%" + keyword + "%' OR cover_artist LIKE '%" + keyword + "%' OR editor LIKE '%" + keyword + "%' ) ORDER BY publication ASC"
      } else if (column === "Artist") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND ( penciller LIKE '%" + keyword + "%' OR inker LIKE '%" + keyword + "%' OR colorist LIKE '%" + keyword + "%' OR letterer LIKE '%" + keyword + "%' OR cover_artist LIKE '%" + keyword + "%' ) ORDER BY publication ASC"
      } else if (column === "Cover Artist") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND cover_artist LIKE '%" + keyword + "%' ORDER BY publication ASC"
      } else if (column === "Year") {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND ( publication BETWEEN '" + keyword + "-01-01' AND '" + keyword + "-12-31' ) ORDER BY publication ASC"
      } else {
        var sql = "SELECT * FROM comics WHERE user_id = " + decoded.payload.user_id + " AND " + column.toLowerCase() + " LIKE '%" + keyword + "%' ORDER BY publication ASC"
      }
      console.log(sql)
      var db = new sqlite('database.db');
      var comics = await db.prepare(sql).all()
      return res.json(comics)
    } else if (req.query.id) {
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE id = (?)').all(req.query.id)
      return res.json(comics)
    } else {
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE user_id = (?) ORDER BY publication ASC').all(decoded.payload.user_id)

      return res.json(comics)}
  } else {
    return res.status(401).json({"message": "expired"})
  }

});

/**
 * @openapi
 * /files/comicsfields:
 *   get:
 *     description: 'Retrieve comic searchable possibilities'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 */
 router.get('/comicsfields', async function(req, res) {
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
   if (req.query.field) {
    if (req.query.field === "All") {
      var field = "series, alternate_series, writer, penciller, inker, colorist, letterer, cover_artist, editor, publisher, imprint, genre, characters"
    } else if (req.query.field === "Series") {
      var field = "series, alternate_series"
    } else if (req.query.field === "Creator") {
      var field = "writer, penciller, inker, colorist, letterer, cover_artist, editor"
    } else if (req.query.field === "Artist") {
      var field = "penciller, inker, colorist, letterer, cover_artist"
    } else if (req.query.field === "Character") {
      var field = "characters"
    } else if (req.query.field === "Cover Artist") {
      var field = "cover_artist"
    } else if (req.query.field === "Year") {
      var field = "publication"
    } else {
      var field = req.query.field.toLowerCase();
    }
      var sql = 'SELECT DISTINCT ' + field + ' FROM comics'
      console.log(sql)
      var db = new sqlite('database.db');
      var possible = await db.prepare(sql).all();
        return res.json(possible)
    } else {
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE user_id = (?) ORDER BY publication ASC').all(decoded.payload.user_id)

      return res.json(comics)}
  } else {
    return res.status(401).json({"message": "expired"})
  }

});

/**
 * @openapi
 * /files/downloads:
 *   get:
 *     description: 'Retrieve comic searchable possibilities'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 */
 router.get('/downloads', async function(req, res) {
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    var src = "." + req.query.file;
    var file = src.split("/").pop();
    var build = file.split("-");
    var dest = "/downloads/";
    for (let i=0;i<build.length-1;i++) {
      if (i<build.length-2) {
        dest = dest + build[i] + "-";
      } else {
        dest = dest + build[i] + ".cbz"
      }
    }
    console.log(src)
    console.log(dest)
    fs.copyFile(src, "." + dest, (err) => {
      if (err) {
        console.log(err)
        return res.status(500)
      } else {
        res.status(200).json({"file": dest})
      }
    })
  } else {
    return res.status(401).json({"message": "expired"})
  }

});

/**
 * @openapi
 * /files/downloads:
 *   delete:
 *     description: 'Retrieve comic searchable possibilities'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 */
 router.delete('/downloads', async function(req, res) {
  console.log("deletion request")
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    console.log(req.query.file);
    try {
      fs.unlinkSync("./" + req.query.file)
      res.status(200);
    } catch (err) {
      console.log(err)
    }
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

/**
 * @openapi
 * /files/cleaner:
 *   delete:
 *     description: 'Retrieve comic searchable possibilities'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 */
 router.get('/cleaner', async function(req, res) {
  console.log("deletion request")
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    try {
      uploader.cleaner(req.query.tmp, req.query.upload)
      res.status(200);
    } catch (err) {
      console.log(err)
    }
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

module.exports = router;