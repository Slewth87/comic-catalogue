var AdmZip = require("adm-zip");
var fs = require("fs");

async function upload(file) {
    // prep folder location and name data
    var folderName = file.name.slice(0, file.name.length -4) + "-" + file.user
    var fileLocator = file.location.slice(0, file.location.length -4) + ".zip";
    // initialise variables for use in loop
    var loop = 0;
    var stored = 0;
    var wait = ms => new Promise(resolve => setTimeout(resolve, ms));

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
        if (loop < 60) {
            loop++;
            stored = fs.statSync(fileLocator).size;
            if (stored < file.size) {
                await wait(1000);
                console.log("Stored, loop " + loop + ": " + stored);
            } else {
                var zip = new AdmZip(fileLocator);
                zip.extractAllTo("./tmp/" + folderName)
                console.log("Extracted on loop " + loop + ": " + stored);
                message = "Upload successful"
                status = 201
            }
        } else {
            console.log("extraction timed out");
            message = "Upload timed out";
            status = 503
            stored = file.size;
        }
    }
    var response = {
        message: message,
        status: status
    }
    return response;
}

module.exports = { upload }