var uploader = require('../processes/Uploader.js');
var express = require('express');
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

router.post('/upload', async function (req, res) {
  try {
          if (!req.files) {
            res.send({
              status: false,
              message: 'No file uploaded'
            });
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
  
              res.send({
                status: true,
                message: 'File uploaded',
                data: filedata
              });

              uploader.upload(filedata);

            } else {
              res.send({
                status: true,
                message: 'Unsupported filetype'
              });
            }

          }
      } catch (err) {
        console.log(err)

        res.status(500).json({
          message: "failed upload"
        })
      }
});

module.exports = router;