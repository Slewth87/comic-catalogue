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
            await wait(1000);
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
                var comicInfo = await XMLReader(extract);
                console.log("THis info")
                console.log(comicInfo.Series)
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
    
    var Title = null;
    var Series = null;
    var Number = null;
    var Count = null;
    var Volume = null;
    var AlternateSeries = null;
    var Summary = null;
    var Notes = null;
    var Year = null;
    var Month = null;
    var Writer = null;
    var Penciller = null;
    var Inker = null;
    var Colorist = null;
    var Letterer = null;
    var CoverArtist = null;
    var Editor = null;
    var Publisher = null;
    var Imprint = null;
    var Genre = null;
    var PageCount = 0;
    var Format = "Standard";
    var Characters = null;
    var Pages = {};

    for (let i=0; i<files.length; i++) {
        // checks if the current entry is an .jpg file 
        if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
            PageCount++;
        }
    }

    for (let i=0;i<Object.keys(rawInfo).length;i++) {
        if (Object.keys(rawInfo)[i] === "Title") {
            Title = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Series") {
            Series = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Number") {
            Number = rawInfo[Object.keys(rawInfo)[i]]
        }  else if (Object.keys(rawInfo)[i] === "Count") {
            Count = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Volume") {
            Volume = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "AlternateSeries") {
            AlternateSeries = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Summary") {
            Summary = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Notes") {
            Notes = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Year") {
            Year = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Month") {
            Month = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Writer") {
            Writer = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Penciller") {
            Penciller = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Inker") {
            Inker = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Colorist") {
            Colorist = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Letterer") {
            Letterer = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "CoverArtist" || Object.keys(rawInfo)[i] === "Cover") {
            CoverArtist = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Editor") {
            Editor = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Publisher") {
            Publisher = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Imprint") {
            Imprint = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Genre") {
            Genre = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Format") {
            Format = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Characters") {
            Characters = rawInfo[Object.keys(rawInfo)[i]]
        } else if (Object.keys(rawInfo)[i] === "Pages") {
            var imageNo = 0;
            var Page = [PageCount];
            Pages = rawInfo[Object.keys(rawInfo)[i]];
            for (let i=0; i<files.length; i++) {
                // checks if the current entry is an .jpg file
                if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
                    var Type = null;
                    var source = location.split(".").pop() + "/" + files[i];
                    if (Pages[Object.keys(Pages)[0]][imageNo].Type) {
                        Type = Pages[Object.keys(Pages)[0]][imageNo].Type;
                    }
                    var dimensions = sizeOf(location+"/"+files[i])
                    Page[imageNo] = {
                        Image: imageNo,
                        Type: Type,
                        ImageWidth: dimensions.width,
                        ImageHeight: dimensions.height,
                        Source: source
                    }
                    imageNo++;
                }
            }
            Pages = Page;
        }
    }

    // function tidy(field, delimiter) {
    //     var loops = field.split("  ").length;
    //     console.log("Spaces: " + loops);
    //     for (let i=0;i<loops;i++) {
    //         if (field.includes("  ")) {
    //             field = field.replace("  ", " ")
    //         }
    //     }
    //     loops = field.split(delimiter).length - 1;
    //     console.log("Commas: " + loops);
    //     for (let i=0;i<loops;i++) {
    //         if (field.includes(delimiter)) {
    //             if (field.includes(" "+delimiter)) {
    //                 field = field.replace(" "+delimiter, delimiter);
    //             }
    //             if (field.includes(delimiter+" ")) {
    //                 field = field.replace(delimiter+" ", delimiter);
    //             }
    //         }
    //     }
    //     return field;
    // }
    
    comicInfo = {
        Title: Title,
        Series: Series,
        Number: Number,
        Count: Count,
        Volume: Volume,
        AlternateSeries: AlternateSeries,
        Summary: Summary,
        Notes: Notes,
        Year: Year,
        Month: Month,
        Writer: Writer,
        Penciller: Penciller,
        Inker: Inker,
        Colorist: Colorist,
        Letterer: Letterer,
        CoverArtist: CoverArtist,
        Editor: Editor,
        Publisher: Publisher,
        Imprint: Imprint,
        Genre: Genre,
        PageCount: PageCount,
        Format: Format,
        Characters: Characters,
        Pages: Pages
    }
    return comicInfo;
}

module.exports = { upload }