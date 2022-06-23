var uploader = require('../processes/Uploader.js');
var express = require('express');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var fileUpload = require('express-fileupload');
var cors = require('cors');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan  = require('morgan');
 
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
  console.log(req.query);
  var token = req.query.token
  try {
    var decoded = await jwt.verify(token, "SECRET_KEY", {complete: true});
  } catch (error) {
      console.log(error)
      return res.status(401).json({
        "message": "Session expired. Please login again"
      })
  }
  if(bcrypt.compareSync(decoded.payload.user_id, decoded.payload.hash)) {
    try {
      if (!req.files) {
        res.status(204).send("No file uploaded");
      } else {
        let comicFile = req.files.comicFile;
        let filetype = comicFile.name.split(".").pop();
        let supported = "cbz"
        if (filetype == supported) {
          let location = './uploads/' + comicFile.name;
          let filedata = {
            name: comicFile.name,
            location: location
          }
          comicFile.mv(location);

          res.status(201).json({
            "message": "File uploaded",
            "data": filedata
          });

          uploader.upload(filedata);

        } else {
          res.status(204).json({
            "status": true,
            "message": "Unsupported filetype"
          });
        }
      }
    } catch (err) {
      console.log(err)

      res.status(500).json({
        "message": "Unknown error"
      })
    }
  } else {
    return res.status(401).json({
      "message": "Session expired. Please login again"
    })
  }
});

module.exports = router;