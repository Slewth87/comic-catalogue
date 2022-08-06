// Handles the API endpoints for comic file manipulation

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
 *       415:
 *         description: Notifies that uploaded filetype is not supported
 *       500:
 *         description: Unknown error returned
 */
router.post('/upload', async function (req, res) {
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
          let uploaded = comicFile.name;

          // Checks for invalid characters in the filename and strips them out
          if (uploaded.includes('#')) {
            while (uploaded.includes('#')) {
              if (uploaded.charAt(0) === "#") {
                uploaded = uploaded.split("#").pop();
              } else {
                uploaded = uploaded.split("#")[0]
              }
            }
          }
          if (uploaded.includes(':')) {
            while (uploaded.includes(':')) {
              if (uploaded.charAt(0) === ":") {
                uploaded = uploaded.split(":").pop();
              } else {
                uploaded = uploaded.split(":")[0]
              }
            }
          }
          if (uploaded.includes('/')) {
            while (uploaded.includes('/')) {
              if (uploaded.charAt(0) === "/") {
                uploaded = uploaded.split("/").pop();
              } else {
                uploaded = uploaded.split("/")[0]
              }
            }
          }
          // console.log("uploaded")
          // console.log(uploaded)

          // Checks uploaded filetype
          let supported = ["cbz","cbr"]
          if (filetype == "cbz") {
            var location = './uploads/' + uploaded.slice(0, uploaded.length -4) + "-" + decoded.payload.user_id + ".zip";
          } else if (filetype == "cbr") {
            var location = './uploads/' + uploaded.slice(0, uploaded.length -4) + "-" + decoded.payload.user_id + ".rar";
          }
          if (supported.includes(filetype)) {
            let filedata = {
              name: uploaded,
              location: location,
              size: comicFile.size,
              user: decoded.payload.user_id
            }
            comicFile.mv(location);
  
            // Passes over to the uploader for deeper processing
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
 *     description: Saves an uploaded file to the database
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
 *       503:
 *         description: Upload timed out
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
        // Passes details to the uploader to process the saving
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
 * /files/check:
 *   get:
 *     description: 'Checks if a passed file already exists in the database'
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
 *         description: Unknown error returned
 */
 router.get('/check', async function (req, res) {
  var token = req.query.token;
  console.log("passed in")
  console.log(req.query)
  var message = "Unknown error";
  var status = 500;
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
    if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
      try {
        status = 200
        var filename = "UnnamedComicBook";
        // Builds the filename from the supplied details
        if (req.query.series) {
            if (req.query.number) {
                if (req.query.vol) {
                    filename = req.query.series + "-v" + req.query.vol + "-" + req.query.number + "-" + decoded.payload.user_id + ".cbz"
                } else {
                    filename = req.query.series + "-" + req.query.number + "-" + decoded.payload.user_id + ".cbz"
                }
            } else {
                filename = req.query.series + "-" + decoded.payload.user_id + ".cbz"
            }
        } else {
            filename = filename + "-" + decoded.payload.user_id + ".cbz"
        }
        // Pulls list of existing files in the db
        var comics = fs.readdirSync("./comics/")
        // console.log("Checking if")
        // console.log(comics)
        // console.log("contains")
        // console.log(filename)
        // Looks for a match
        if (comics.includes(filename)) {
          var title = filename.split("-");
          // console.log("title")
          // console.log(title)
          message = "";
          // Pulls the id of the file which matches the one being uploaded
          var db = new sqlite('database.db');
          var dupe = await db.prepare('SELECT id FROM comics WHERE comic_file = (?)').all("/comics/" + filename)
          // console.log("dupe")
          // console.log(dupe)
          var dupeID = [];
          // converts to an array of integers instead of an array of JSON objects
          for (let i=0;i<dupe.length;i++) {
            dupeID[i] = dupe[i].id
          }
          var dupename = "";
          for (let i=0;i<title.length-1;i++) {
            dupename = dupename + title[i] + " "
            // console.log("dupename")
            // console.log(dupename)
          }
          message = {
            id: dupeID,
            name: dupename
          }
          status = 200;
        } else {
          message = "all clear";
          status = 200;
        }
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
 *         description: Returns success message with details of comic retrieved
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
    // If there are search parameters, only return comics matching those parameters
    if (req.query.search) {
      const search = JSON.parse(req.query.search)
      var column = search.field;
      var keyword = search.keyword;

      // Tidies up some possible breaking characters in the passed keyword
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

      // Sets the appropriate SQL statement based on the passed search details
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
      // Pulls the details of the searched for comics
      var db = new sqlite('database.db');
      var comics = await db.prepare(sql).all()
      return res.json(comics)

    } else if (req.query.id) {
      // Pulls the details of a single comic when an id is passed
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE id = (?)').all(req.query.id)
      return res.json(comics)
    } else {
      // Pulls all a particular users comics
      var db = new sqlite('database.db');
      var comics = await db.prepare('SELECT * FROM comics WHERE user_id = (?) ORDER BY publication ASC').all(decoded.payload.user_id)

      return res.json(comics)}
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

/**
 * @openapi
 * /files/comics:
 *   delete:
 *     description: 'Deletes comic from the db'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic deleted
 *       401:
 *         description: Notifies that passed token has expired
 */
 router.delete('/comics', async function(req, res) {
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({"message": "expired"})
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    try {
      var comic = JSON.parse(req.query.comic)
      // Delete the comic from the db
      var db = new sqlite('database.db');
      var result = await db.prepare('DELETE FROM comics WHERE id = ' + comic.id).run()
      console.log(result)
      // delete the associated files from storage
      fs.unlinkSync("." + comic.file)
      fs.unlinkSync("." + comic.thumbnail)
      return res.status(200).send(result);
    } catch (err) {
      console.log(err);
      return res.status(500);
    }
  }
 });

 /**
 * @openapi
 * /files/prep:
 *   get:
 *     description: 'Pulls comics from storage to prepare them for editing'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 *       500:
 *         description: Encountered unknown error
 */
  router.get('/prep', async function(req, res) {
    var token = req.query.token
    var response = {
      status: 500,
      message: "Unknown error"
    }
    try {
      var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
    } catch (error) {
        console.log(error)
        return res.status(401).json({"message": "expired"})
    }
    if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
      try {
        var comic = JSON.parse(req.query.comic)
        var start = "." + comic.comic_file
        let size = fs.statSync(start).size
        var series = comic.series;
        // Handles any invalid characters in filename generation
        if (comic.series.includes('#')) {
            series = comic.series.replace("#", "")
        }
        if (series.includes(':')) {
                series = comic.series.replace(":", "")
        }
        if (series.includes('/')) {
                series = comic.series.replace("/", "")
        }
        // Build the new filename
        let location = "./uploads/" + series
        if (comic.issue_number) {
          if (comic.volume) {
            location = location + "-v" + comic.volume + "-" + comic.issue_number
          } else {
            location = location + "-" + comic.issue_number
          }
        }
        location = location + "-" + decoded.payload.user_id
        // Move the stored file to the uploads folder where it can be manipulated the same way a new upload would be
        await fs.rename(start, location + ".zip", function (err) {
          if (err) {
            console.log(err)
            return res.status(500).send();
          }
        })
        let filedata = {
          name: location.split("/").pop() + ".cbz",
          location: location + ".zip",
          size: size,
          user: decoded.payload.user_id
        }
        // Pass the details to the uploader where at this point it can be treated the same as a new upload
        response = await uploader.upload(filedata);
        // console.log(response)
        return res.status(response.status).send(response.message);
      } catch (err) {
        console.log(err);
        return res.status(500);
      }
    }
   });

/**
 * @openapi
 * /files/comicsfields:
 *   get:
 *     description: 'Retrieve list of possible search terms to populate the search dropdown'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming search terms retrieved
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

      // Maps the Search Fields to appropriate database table columns
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
      // Pulls all possible terms from the specified columns
      var sql = 'SELECT DISTINCT ' + field + ' FROM comics WHERE user_id = ' + decoded.payload.user_id
      console.log(sql)
      var db = new sqlite('database.db');
      var possible = await db.prepare(sql).all();
      return res.json(possible)
    }
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

/**
 * @openapi
 * /files/downloads:
 *   get:
 *     description: 'Build a downloadable version of a comic file'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic download file built, and its location
 *       401:
 *         description: Notifies that passed token has expired
 *       500:
 *         description: Unknown error encountered
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
    // Removes the User_ID from the filename for the downloadable version
    for (let i=0;i<build.length-1;i++) {
      if (i<build.length-2) {
        dest = dest + build[i] + "-";
      } else {
        dest = dest + build[i] + ".cbz"
      }
    }
    // console.log(src)
    // console.log(dest)
    // Copies the the original file to the downloads folder, with the new filename
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
 *     description: 'Deletes the downloadable copy of the file'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic deleted
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
      return res.status(200);
    } catch (err) {
      console.log(err)
      return res.status(500)
    }
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

/**
 * @openapi
 * /files/cleaner:
 *   get:
 *     description: 'Cleans up temp files after editing complete'
 *     produces:
 *       application/json
 *     responses:
 *       200:
 *         description: Returns success message confirming comic retrieved
 *       401:
 *         description: Notifies that passed token has expired
 *       500:
 *         description: Unknown erro encountered
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
      // Pass details to the uploader for deeper processing
      uploader.cleaner(req.query.tmp, req.query.upload, req.query.source, decoded.payload.user_id)
      return res.status(200);
    } catch (err) {
      console.log(err)
      return res.status(500)
    }
  } else {
    return res.status(401).json({"message": "expired"})
  }
});

module.exports = router;