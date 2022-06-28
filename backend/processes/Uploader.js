var AdmZip = require("adm-zip");
var fs = require("fs");
var parser = require('xml2json');
var sizeOf = require('image-size');

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
                    message: "Upload of " + comicInfo.series + " Vol. " + comicInfo.volume + " #" + comicInfo.number + " successful",
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
    var rawInfo = extractor(extract);
    // if no data found, tries a subdirectory
    if (!rawInfo && layers < 1) {
        // sets quit condition so it doesn't keep exploring layers if the xml file isn't located at a valid level
        layers++;
        // gets an array of contained files/folders
        var files = fs.readdirSync(extract)
        // checks each entry in the file/folder array
        for (let i=0; i<files.length; i++) {
            console.log("Folder: " + extract + "/" + files[i])
            // check if an entry is a directory, making sure to skip hidden files/folders
            if (fs.statSync(extract + "/" +files[i]).isDirectory() && files[i].charAt(0) != "_" && files[i].charAt(0) != ".") {
                extract = extract + "/" + files[i]
                console.log("try me")
                // attempts the data extraction again with the new root
                rawInfo = extractor(extract);
            }
        }
    }
    var comicInfo = normaliser(rawInfo, extract);
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
        if (files[i].split(".").pop().toLowerCase() == "xml") {
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

function normaliser(rawInfo, location) {
    var comicInfo = rawInfo;
    var files = fs.readdirSync(location)
    // console.log("Page")
    // console.log(comicInfo.Pages.Page[0])
    var series = null;
    var title = [];
    var storyline = null;
    var number = null;
    var count = null;
    var volume = null;
    var month = null;
    var year = null;
    var writer = [];
    var penciller = [];
    var inker = [];
    var colorist = [];
    var letterer = [];
    var coverArtist = [];
    var editor = [];
    var publisher = null;
    var imprint = null;
    var pageCount = 0;
    var format = "Standard";
    var characters = [];
    var pages = {};

    for (let i=0; i<files.length; i++) {
        // checks if the current entry is an .jpg file 
        if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
            pageCount++;
        }
    }

    for (let i=0;i<Object.keys(rawInfo).length;i++) {
        if (Object.keys(rawInfo)[i] === "Series") {
            series = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Title") {
            var titString = tidy(rawInfo[Object.keys(rawInfo)[i]], "/");
            title = titString.split("/");
        } else if (Object.keys(rawInfo)[i] === "Storyline" || Object.keys(rawInfo)[i] === "AlternateSeries") {
            storyline = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Number" || Object.keys(rawInfo)[i] === "Issue") {
            number = rawInfo[Object.keys(rawInfo)[i]]
        }  else if (Object.keys(rawInfo)[i] === "Count") {
            count = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Volume") {
            volume = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Month") {
            month = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Year") {
            year = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Writer") {
            var wriString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            writer = wriString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Penciller") {
            var penString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            penciller = penString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Inker") {
            var inkString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            inker = inkString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Colourist" || Object.keys(rawInfo)[i] === "Colorist") {
            var colString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            colorist = colString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Letterer") {
            var letString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            letterer = letString.split(",");
        } else if (Object.keys(rawInfo)[i] === "CoverArtist" || Object.keys(rawInfo)[i] === "Cover") {
            var covString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            coverArtist = covString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Editor") {
            var edString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            editor = edString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Publisher") {
            publisher = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Imprint") {
            imprint = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Format") {
            format = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Characters") {
            var chaString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            characters = chaString.split(",");
        } else if (Object.keys(rawInfo)[i] === "Artist" && penciller == [] && inker == []) {
            var penString = tidy(rawInfo[Object.keys(rawInfo)[i]], ",");
            penciller = penString.split(",");
            inker = penciller;
        } else if (Object.keys(rawInfo)[i] === "Pages") {
            var imageNo = 0;
            var page = [pageCount];
            pages = rawInfo[Object.keys(rawInfo)[i]];
            for (let i=0; i<files.length; i++) {
                // checks if the current entry is an .jpg file
                if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
                    var type = null;
                    if (pages[Object.keys(pages)[0]][imageNo].Type) {
                        type = pages[Object.keys(pages)[0]][imageNo].Type;
                    }
                    var dimensions = sizeOf(location+"/"+files[i])
                    page[imageNo] = {
                        Image: imageNo,
                        type: type,
                        ImageWidth: dimensions.width,
                        ImageHeight: dimensions.height
                    }
                    imageNo++;
                }
            }
            pages = page;
        }
    }

    console.log("Normalised series:");
    console.log(series);
    console.log("Normalised title:");
    console.log(title);
    console.log("Normalised storyline:");
    console.log(storyline);
    console.log("Normalised number:");
    console.log(number);
    console.log("Normalised count:");
    console.log(count);
    console.log("Normalised volume:");
    console.log(volume);
    console.log("Normalised month:");
    console.log(month);
    console.log("Normalised year:");
    console.log(year);
    console.log("Normalised writer:");
    console.log(writer);
    console.log("Normalised penciller:");
    console.log(penciller);
    console.log("Normalised inker:");
    console.log(inker);
    console.log("Normalised colorist:");
    console.log(colorist);
    console.log("Normalised letterer:");
    console.log(letterer);
    console.log("Normalised coverArtist:");
    console.log(coverArtist);
    console.log("Normalised editor:");
    console.log(editor);
    console.log("Normalised publisher:");
    console.log(publisher);
    console.log("Normalised imprint:");
    console.log(imprint);
    console.log("Normalised format:");
    console.log(format);
    console.log("Normalised pageCount:");
    console.log(pageCount);
    console.log("Normalised characters:");
    console.log(characters);
    console.log("Normalised pages:");
    for (let i=0; i<pages.length;i++) {
        console.log(pages[i])
    }

    function tidy(field, delimiter) {
        var loops = field.split("  ").length;
        console.log("Spaces: " + loops);
        for (let i=0;i<loops;i++) {
            if (field.includes("  ")) {
                field = field.replace("  ", " ")
            }
        }
        loops = field.split(delimiter).length - 1;
        console.log("Commas: " + loops);
        for (let i=0;i<loops;i++) {
            if (field.includes(delimiter)) {
                if (field.includes(" "+delimiter)) {
                    field = field.replace(" "+delimiter, delimiter);
                }
                if (field.includes(delimiter+" ")) {
                    field = field.replace(delimiter+" ", delimiter);
                }
            }
        }
        return field;
    }
    comicInfo = {
        series: series,
        title: title,
        storyline: storyline,
        number: number,
        count: count,
        volume: volume,
        month: month,
        year: year,
        writer: writer,
        penciller: penciller,
        inker: inker,
        colorist: colorist,
        letterer: letterer,
        coverArtist: coverArtist,
        editor: editor,
        publisher: publisher,
        imprint: imprint,
        format: format,
        pageCount: pageCount,
        characters: characters,
        pages: pages
    }
    return comicInfo;
}

module.exports = { upload }