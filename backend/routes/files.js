var express = require('express');
var fileUpload = require('express-fileupload');
var cors = require('cors');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan  = require('morgan');
var _  = require('lodash');
 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(fileUpload({
  createParentPath: true
}));
router.use(cors());
router.use(morgan('dev'));

router.post('/upload', async function (req, res) {
  console.log("hit me")
  try {
          if (!req.files) {
            res.send({
              status: false,
              message: 'No file uploaded'
            });
          } else {
            let comicFile = req.files.comicFile;

            comicFile.mv('./uploads/' + comicFile.name);

            res.send({
              status: true,
              message: 'File uploaded',
              data: {
                name: comicFile.name,
                mimettype: comicFile.mimettype,
                size: comicFile.size
              }
            });
          }
      } catch (err) {
        console.log(err)

        res.status(500).json({
          message: "failed upload"
        })
      }
});

module.exports = router;