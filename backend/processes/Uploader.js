var AdmZip = require("adm-zip");
var fs = require("fs");
var parser = require('xml2json');

async function upload(file) {
    // prep folder location and name data
    var folderName = file.name.slice(0, file.name.length -4) + "-" + file.user
    var fileLocator = file.location.slice(0, file.location.length -4) + ".zip";
    // initialise variables for use in loop
    var loop = 0;
    var stored = 0;
    var wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // initialise responses
    var message;
    var status;

    // Logging
    console.log(fileLocator)
    console.log(file)
    console.log("Name: " + folderName)
    console.log("Location: " + fileLocator)
    console.log("Size: " + file.size)
    console.log("Stored: " + stored)

    // Loop to make sure upload is complete before extracting zipped files
    while (stored < file.size) {
        // allowing a minute for the upload to complete
        if (loop < 60) {
            loop++;
            stored = fs.statSync(fileLocator).size;
            // checks upload status by comparing the raw file size to the stored file size
            if (stored < file.size) {
                await wait(1000);
                console.log("Stored, loop " + loop + ": " + stored);
            } else {
                // Extracts the files from the zip
                var extract = "./tmp/" + folderName
                var zip = new AdmZip(fileLocator);
                zip.extractAllTo(extract)
                console.log("Extracted on loop " + loop + ": " + stored);
                // Call to store the metadata from the .xml file contained within
                var comicInfo = XMLReader(extract);
                message = {
                    message: "Upload of " + comicInfo.Series + " Vol. " + comicInfo.Volume + " #" + comicInfo.Number + " successful",
                    comic: comicInfo
                };
                status = 201;
                console.log("comicInfo");
                console.log(comicInfo);
            }
        } else {
            // quits if the upload takes too long
            console.log("extraction timed out");
            message = "Upload timed out";
            status = 503
            stored = file.size;
        }
    }
    // sends the response status
    var response = {
        message: message,
        status: status
    }
    return response;
}

// extracting the data from the xml file
function XMLReader(extract) {
    // need to find the xml file first, checks top level and subdirectory if zip format uses one
    var layers = 0;
    // attempts a data extraction
    var comicInfo = extractor(extract);
    // if no data found, tries a subdirectory
    if (!comicInfo && layers < 1) {
        // sets quit condition so it doesn't keep exploring layers if the xml file isn't located at a valid level
        layers++;
        // gets an array of contained files/folders
        var files = fs.readdirSync(extract)
        // checks each entry in the file/folder array
        for (let i=0; i<files.length; i++) {
            console.log("Folder: " + extract + "/" + files[i])
            // check if an entry is a directory, making sure to skip hidden files/folders
            if (fs.statSync(extract + "/" +files[i]).isDirectory() && files[i].charAt(0) != "_" && files[i].charAt(0) != ".") {
                var passing = extract + "/" + files[i]
                console.log("try me")
                // attempts the data extraction again with the new root
                comicInfo = extractor(passing);
            }
        }
    }
    return comicInfo;
}

function extractor(extract) {
    console.log("Received: " + extract)
    // gets all entries in the folder
    var files = fs.readdirSync(extract)
    var comicInfo;
    // checks each entry
    for (let i=0; i<files.length; i++) {
        // checks if the current entry is an .xml file 
        if (files[i].split(".").pop() == "xml") {
            console.log(files[i] + " got here")
            // attempts to extract the xml content to a JSON object
            try {
                var raw = JSON.parse(parser.toJson(fs.readFileSync(extract + "/" +files[i], 'utf8')));
                comicInfo = raw[Object.keys(raw)[0]]
              } catch (err) {
                console.error(err);
              }
              // quits the loop after the xml has been found
            i = files.length;
        }
    }
        return comicInfo;
}

module.exports = { upload }