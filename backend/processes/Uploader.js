// Deeper processing and manipulation of files rather than trying to do everything immediately in the ./routes/files.js endpoints

const AdmZip = require("adm-zip");
const Unrar = require('node-unrar-js');
const fs = require("fs");
const parser = require('xml2json');
const sizeOf = require('image-size');
const format = require('js2xmlparser');
const sqlite = require('better-sqlite3');

// Initial processing of uploaded or editing files
async function upload(file) {
    // prep folder location and name data
    // console.log("first hit of uploader")
    // console.log(file)
    var folderName = file.name.slice(0, file.name.length -4) + "-" + file.user
    // initialise variables for use in loop
    var loop = 0;
    var stored = 0;
    var wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    // initialise responses
    var message;
    var status;

    // Loop to make sure upload is complete before extracting zipped files
    while (stored < file.size) {
        // allowing a minute for the upload to complete
        if (loop < 60) {
            loop++;
            await wait(1000);
            stored = fs.statSync(file.location).size;
            // checks upload status by comparing the raw file size to the stored file size
            if (stored < file.size) {
                await wait(1000);
                // console.log("Stored, loop " + loop + ": " + stored);
            } else {
                // Extracts the files from the zip
                var extract = "./tmp/" + folderName
                console.log("Extractor")
                if (file.location.split(".").pop() === "zip") {
                    // console.log("Extract zip")
                    var zip = new AdmZip(file.location);
                    zip.extractAllTo(extract)
                } else if (file.location.split(".").pop() === "rar") {
                    // console.log("Extract rar")
                    await rarExtractor(file.location, extract)
                }
                // console.log("Extracted on loop " + loop + ": " + stored);
                // Call to store the metadata from the .xml file contained within
                var comicInfo = await XMLReader(extract);
                // console.log("THis info")
                // console.log(comicInfo.Series)
                message = {
                    message: "Comic file prepped for saving",
                    comic: comicInfo
                };
                status = 201;
                // console.log("comicInfo");
                // console.log(comicInfo);
            }
        } else {
            // quits if the upload takes too long
            // console.log("extraction timed out");
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
async function XMLReader(extract) {
    // need to find the xml file first, checks top level and subdirectory if zip format uses one
    var layers = 0;
    // attempts a data extraction
    var rawInfo = await extractor(extract);
    // if no data found, tries a subdirectory
    if (!rawInfo && layers < 1) {
        // sets quit condition so it doesn't keep exploring layers if the xml file isn't located at a valid level
        layers++;
        // gets an array of contained files/folders
        var files = fs.readdirSync(extract)
        // checks each entry in the file/folder array
        for (let i=0; i<files.length; i++) {
            // console.log("Folder: " + extract + "/" + files[i])
            // check if an entry is a directory, making sure to skip hidden files/folders
            if (fs.statSync(extract + "/" +files[i]).isDirectory() && files[i].charAt(0) != "_" && files[i].charAt(0) != ".") {
                extract = extract + "/" + files[i]
                // console.log("try me")
                // attempts the data extraction again with the new root
                rawInfo = await extractor(extract);
            }
        }
    }
    // console.log("extraction passed")
    // console.log(rawInfo)
    var comicInfo = normaliser(rawInfo, extract);
    return comicInfo;
}

// Extracts files if the filetype is rar/cbr
async function rarExtractor(file, destination) {
    try {
        const extractor = await Unrar.createExtractorFromFile({
            filepath: file,
            targetPath: destination
        });

        [...extractor.extract().files];
    } catch (err) {
        console.error(err);
    }
}

// finds and extracts data from the xml
function extractor(extract) {
    // console.log("Received: " + extract)
    // gets all entries in the folder
    var files = fs.readdirSync(extract)
    var comicInfo;
    // checks each entry
    for (let i=0; i<files.length; i++) {
        // checks if the current entry is an .xml file 
        if (files[i].split(".").pop().toLowerCase() == "xml") {
            // console.log(files[i] + " got here")
            // attempts to extract the xml content to a JSON object
            try {
                // console.log("Raw json:")
                // console.log(parser.toJson(fs.readFileSync(extract + "/" +files[i], 'utf8')))
                var raw = JSON.parse(parser.toJson(fs.readFileSync(extract + "/" +files[i], 'utf8')));
                comicInfo = raw[Object.keys(raw)[0]]
              } catch (err) {
                console.error(err);
              }
              // quits the loop after the xml has been found
            i = files.length;
        }
    }
        console.log("Post extraction")
        console.log(comicInfo)
        return comicInfo;
}

// Normalises data from the xml
function normaliser(rawInfo, location) {
    var comicInfo = rawInfo;
    var files = fs.readdirSync(location)
    
    var title = null;
    var series = null;
    var number = null;
    var count = null;
    var volume = null;
    var alternateSeries = null;
    var summary = null;
    var notes = null;
    var year = null;
    var month = null;
    var writer = null;
    var penciller = null;
    var inker = null;
    var colorist = null;
    var letterer = null;
    var coverArtist = null;
    var editor = null;
    var publisher = null;
    var imprint = null;
    var genre = null;
    var pageCount = 0;
    var format = "Standard";
    var characters = null;
    var pages = {};

    for (let i=0; i<files.length; i++) {
        // checks if the current entry is a .jpg file 
        if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
            pageCount++;
        }
    }
    // Maps file info from the xml to the relevant variables
    if (rawInfo != null) {
        for (let i=0;i<Object.keys(rawInfo).length;i++) {
            if (Object.keys(rawInfo)[i] === "Title") {
                title = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Series") {
                series = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Number") {
                number = rawInfo[Object.keys(rawInfo)[i]]
            }  else if (Object.keys(rawInfo)[i] === "Count") {
                count = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Volume") {
                volume = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "AlternateSeries") {
                alternateSeries = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Summary") {
                summary = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Notes") {
                notes = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Year") {
                year = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Month") {
                month = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Writer") {
                writer = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Penciller") {
                penciller = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Inker") {
                inker = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Colorist") {
                colorist = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Letterer") {
                letterer = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "CoverArtist" || Object.keys(rawInfo)[i] === "Cover") {
                coverArtist = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Editor") {
                editor = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Publisher") {
                publisher = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Imprint") {
                imprint = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Genre") {
                genre = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Format") {
                format = rawInfo[Object.keys(rawInfo)[i]]
            } else if (Object.keys(rawInfo)[i] === "Characters") {
                characters = rawInfo[Object.keys(rawInfo)[i]]
            } 
            pages = rawInfo[Object.keys(rawInfo)[i]];
        }
    }

    // Sets the page info as JSON objects
    var imageNo = 0;
        var page = [pageCount];
        // pages = rawInfo[Object.keys(rawInfo)[i]];
        for (let i=0; i<files.length; i++) {
            // checks if the current entry is an .jpg file
            if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
                var type = null;
                var source = location.split(".").pop() + "/" + files[i];
                var dimensions = sizeOf(location+"/"+files[i])
                page[imageNo] = {
                    image: imageNo,
                    type: type,
                    imageWidth: dimensions.width,
                    imageHeight: dimensions.height,
                    source: source
                }
                imageNo++;
            }
        }
        pages = page;
    
        //builds the details into a response
        comicInfo = {
            title: title,
            series: series,
            number: number,
            count: count,
            volume: volume,
            alternateSeries: alternateSeries,
            summary: summary,
            notes: notes,
            year: year,
            month: month,
            writer: writer,
            penciller: penciller,
            inker: inker,
            colorist: colorist,
            letterer: letterer,
            coverArtist: coverArtist,
            editor: editor,
            publisher: publisher,
            imprint: imprint,
            genre: genre,
            pageCount: pageCount,
            format: format,
            characters: characters,
            pages: pages,
            location: location
        }

    // console.log("Normalised")
    // console.log(comicInfo)
    return comicInfo;
}

// Manages the saving of the comic and data to relevant folders and the database
async function save(data, user_id) {
    // Builds a new xml file from received edited data
    await buildXml(data);
    // saves the comic file to long term storage
    var location = await zipIt(data, user_id);
    // Adds the comic metadata to the database
    await storeIt(data, location, user_id);
}

// Builds a new xml file from received edited data
function buildXml(data) {
    var json = "{";
    if (data.title) {
        json = json + " \"Title\": \"" + data.title + "\","
    }
    if (data.series) {
        json = json + " \"Series\": \"" + data.series + "\","
    }
    if (data.number) {
        json = json + " \"Number\": " + data.number + ","
    }
    if (data.count) {
        json = json + " \"Count\": " + data.count + ","
    }
    if (data.volume) {
        json = json + " \"Volume\": " + data.volume + ","
    }
    if (data.alternateSeries) {
        json = json + " \"AlternateSeries\": \"" + data.alternateSeries + "\","
    }
    if (data.summary) {
        json = json + " \"Summary\": \"" + data.summary + "\","
    }
    if (data.notes) {
        json = json + " \"Notes\": \"" + data.notes + "\","
    }
    if (data.year) {
        json = json + " \"Year\": " + data.year + ","
    }
    if (data.month) {
        json = json + " \"Month\": " + data.month + ","
    }
    if (data.writer) {
        json = json + " \"Writer\": \"" + data.writer + "\","
    }
    if (data.penciller) {
        json = json + " \"Penciller\": \"" + data.penciller + "\","
    }
    if (data.inker) {
        json = json + " \"Inker\": \"" + data.inker + "\","
    }
    if (data.colorist) {
        json = json + " \"Colorist\": \"" + data.colorist + "\","
    }
    if (data.letterer) {
        json = json + " \"Letterer\": \"" + data.letterer + "\","
    }
    if (data.coverArtist) {
        json = json + " \"CoverArtist\": \"" + data.coverArtist + "\","
    }
    if (data.editor) {
        json = json + " \"Editor\": \"" + data.editor + "\","
    }
    if (data.publisher) {
        json = json + " \"Publisher\": \"" + data.publisher + "\","
    }
    if (data.imprint) {
        json = json + " \"Imprint\": \"" + data.imprint + "\","
    }
    if (data.genre) {
        json = json + " \"Genre\": \"" + data.genre + "\","
    }
    if (data.pageCount) {
        json = json + " \"PageCount\": " + data.pageCount + ","
    }
    if (data.format) {
        json = json + " \"Format\": \"" + data.format + "\","
    }
    if (data.characters) {
        json = json + " \"Characters\": \"" + data.characters + "\","
    }
    if (data.pages) {
        json = json + " \"Pages\": { \"Page\": ["
        for (let i=0;i<data.pageCount;i++) {
            json = json + "{\"@\": { \"Image\": \"" + data.pages[i].image + "\","
            if (data.pages[i].type) {
                json = json + " \"Type\": \"" + data.pages[i].type + "\","
            }
            json = json + " \"ImageWidth\": \"" + data.pages[i].imageWidth + "\", \"ImageHeight\": \"" + data.pages[i].imageHeight + "\"}}"
            if ((i+1) != data.pageCount ) {
                json = json + ","
            } else {
                json = json + "]}"
            }
        }
    }
    json = json + "}"
    // console.log(json)
    //converts the built data to an xml file
    var xml = format.parse("ComicInfo", JSON.parse(json))
    // console.log(xml);
    // saves the xml file within the comic folder
    let finalxml = data.location + "/ComicInfo.xml";
    fs.writeFileSync(finalxml, xml, function(err) {
        if (err) {
            console.log(err)
        };
    });
}

// zips and stores the new comic file
function zipIt(data, user_id) {
    var zip = new AdmZip();
    var files = fs.readdirSync(data.location)
    var filename = "UnnamedComicBook";
    // console.log(data)
    // Adds all the relevant files to the zip
    zip.addLocalFile(data.location + "/ComicInfo.xml")
    for (let i=0;i<files.length;i++) {
        if (files[i].split(".").pop().toLowerCase() == "jpg" || files[i].split(".").pop().toLowerCase() == "jpeg") {
            zip.addLocalFile(data.location + "/" + files[i]);
        }
    }
    // Builds the new comic file name
    if (data.series) {
        var series = data.series;
        // Ensures the new file name doesn't include any invalid characters
        if (data.series.includes('#')) {
            series = data.series.replace("#", "")
        }
        if (series.includes(':')) {
                series = data.series.replace(":", "")
        }
        if (series.includes('/')) {
                series = data.series.replace("/", "")
        }
        if (data.number) {
            if (data.volume) {
                filename = series + "-v" + data.volume + "-" + data.number + "-" + user_id
            } else {
                filename = series + "-" + data.number + "-" + user_id
            }
        } else {
            filename = series + "-" + user_id
        }
    } else {
        filename = filename + "-" + user_id
    }

    // Saves the thumbnail image for the file
    if (data.thumb) {
        fs.copyFile("." + data.thumb, "./thumbnails/" + filename + ".jpg", (err) => {
            if (err) {
                console.log("Error creating thumbnail: " + err)
            } else {
                console.log("Thumbnail created")
            }
        });
    }

    // sets where to save the files
    var locator = {
        cbz: "/comics/" + filename + ".cbz",
        thumb: "/thumbnails/" + filename + ".jpg"
    }

    // savese the new zip/cbz
    zip.writeZip("." + locator.cbz)
    // Clears temp files
    clearUploads(user_id)
    return locator;
}

// Clears temp files
function clearUploads(user) {
    var finishedUploads = fs.readdirSync("./uploads/")
    for (let i=0;i<finishedUploads.length;i++) {
        if (finishedUploads[i] != ".gitkeep" && (finishedUploads[i].split("-").pop() === user + ".zip" || finishedUploads[i].split("-").pop() === user + ".rar")) {
            fs.unlink("./uploads/" + finishedUploads[i], (err) => {
                if (err) {
                    console.log("error clearing uploads", err);
                }
            })
        }
    }
}

// cleans out temporary files
async function cleaner(tmp, upload, source, user) {
    var extension = "zip";
    // console.log("cleaner")
    // console.log(tmp)
    // console.log(upload)
    //Clears the tmp folder
    fs.rmdir("./tmp/" + tmp.split("/")[2], { recursive: true, force: true }, (err) => {
        if (err) {
            return console.log("error deleting raw", err)
        } else {
            console.log("Deleted raw")
        }
    })

    // Clears the temp folders when the new file is saved
    if (source === "save") {
        // sets the aproppriate filetype to look for based on the upload
        if (upload.split(".").pop() === "cbz") {
            extension = "zip"
        } else if (upload.split(".").pop() === "cbr") {
            extension = "rar"
        }
        // console.log("tmp: " + tmp)
        // console.log("upload: " + upload)
        var file = upload.split(".")
        // console.log(file)

        // clears the tmp folder
        clearUploads(tmp.split("-").pop())

        // clears out the old thumbnail by deleting thumbnail files that are no longer referenced in the database (also serves to clean up this folder if anything else caused an errant thumbnail appeared here)
        var db = new sqlite('database.db', { verbose: console.log});
        // get a list of thumbnails referenced in the database
        var thumbBase = await db.prepare('SELECT thumbnail FROM comics WHERE user_id = (?)').all(user)
        // get a list of thumbnails saved in storage
        var thumbs = fs.readdirSync("./thumbnails/")
        var baseArray = [];
        // convert database result to a format for comparison to the storage result
        for (let i=0;i<thumbBase.length;i++) {
            baseArray[i] = JSON.stringify(thumbBase[i].thumbnail).split("/").pop()
        }
        // console.log("thumbBase")
        // console.log(baseArray)
        // console.log("thumbs")
        // console.log(thumbs)
        // Build an array of thumbnails which are not referenced in the database
        if (thumbs.length > baseArray.length) {
            var clearout = [];
            var spot = 0;
            for (let i=0;i<thumbs.length;i++) {
                if (!baseArray.includes(thumbs[i]+'"')) {
                    if (thumbs[i] != ".gitkeep") {
                        clearout[spot] = thumbs[i]
                        spot++;
                    }
                }
            }
            // console.log("clearout")
            // console.log(clearout)
            // deletes thumbnails which are not referenced in the database
            for (let i=0;i<clearout.length;i++) {
                fs.unlink("./thumbnails/" + clearout[i], (err) => {
                    if (err) {
                        console.log("error clearing thumbnails", err);
                    }
                })
            }
        }
        // Puts comic files back into main storage if the edit is cancelled
    } else if (source === "cancel") {
      let location = "./comics/" + upload.split("/").pop().split(".")[0] + ".cbz"
      await fs.rename(upload, location, function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
}

// stores comic details in the database
function storeIt(data, location, user_id) {
    // console.log("prepping:")
    // console.log(data)
    var title;
    var series;
    var issue_number;
    var series_count;
    var volume;
    var alternate_series;
    var summary;
    var notes;
    var publication;
    var writer;
    var penciller;
    var inker;
    var colorist;
    var letterer;
    var cover_artist;
    var editor;
    var publisher;
    var imprint;
    var genre;
    var comic_format;
    var characters;
    var thumbnail = location.thumb;
    var comic_file = location.cbz;


    if (data.title) {
        title = data.title
    }
    if (data.series) {
        series = data.series
    }
    if (data.number) {
        issue_number = data.number
    }
    if (data.count) {
        series_count = data.count
    }
    if (data.volume) {
        volume = data.volume
    }
    if (data.alternateSeries) {
        alternate_series = data.alternateSeries
    }
    if (data.summary) {
        summary = data.summary
    }
    if (data.notes) {
        notes = data.notes
    }
    if (data.year) {
        if (data.month) {
            if (data.month < 10) {
                publication = data.year + "-0" + data.month + "-01"
            } else {
                publication = data.year + "-" + data.month + "-01"
            }
        } else {
            publication = data.year + "-01-01"
        }
    }
    if (data.writer) {
        writer = data.writer
    }
    if (data.penciller) {
        penciller = data.penciller
    }
    if (data.inker) {
        inker = data.inker
    }
    if (data.colorist) {
        colorist = data.colorist
    }
    if (data.letterer) {
        letterer = data.letterer
    }
    if (data.coverArtist) {
        cover_artist = data.coverArtist
    }
    if (data.editor) {
        editor = data.editor
    }
    if (data.publisher) {
        publisher = data.publisher
    }
    if (data.imprint) {
        imprint = data.imprint
    }
    if (data.genre) {
        genre = data.genre
    }
    if (data.format) {
        comic_format = data.format
    }
    if (data.characters) {
        characters = data.characters
    }

    try {
        var db = new sqlite('database.db');
        if (data.source === "upload") {
            // add a new entry to the database if this is an upload of a new file
            db.prepare('INSERT INTO comics (user_id, title, series, issue_number, series_count, volume, alternate_series, summary, notes, publication, writer, penciller, inker, colorist, letterer, cover_artist, editor, publisher, imprint, genre, comic_format, characters, thumbnail, comic_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user_id, title, series, issue_number, series_count, volume, alternate_series, summary, notes, publication, writer, penciller, inker, colorist, letterer, cover_artist, editor, publisher, imprint, genre, comic_format, characters, thumbnail, comic_file);
        } else if (data.source === "edit") {
            // update a database entry if this is the editing of an existing file
            db.prepare('UPDATE comics SET user_id = ?, title = ?, series = ?, issue_number = ?, series_count = ?, volume = ?, alternate_series = ?, summary = ?, notes = ?, publication = ?, writer = ?, penciller = ?, inker = ?, colorist = ?, letterer = ?, cover_artist = ?, editor = ?, publisher = ?, imprint = ?, genre = ?, comic_format = ?, characters = ?, thumbnail = ?, comic_file = ? WHERE id = ?').run(user_id, title, series, issue_number, series_count, volume, alternate_series, summary, notes, publication, writer, penciller, inker, colorist, letterer, cover_artist, editor, publisher, imprint, genre, comic_format, characters, thumbnail, comic_file, data.id);
        } 
        // var upload = db.prepare('SELECT * FROM comics WHERE user_id = (?)').all(user_id)
        // console.log("Database updated")
        // console.log(upload)
    } catch (err) {
        console.log(err)
    }
}

module.exports = { upload, save, cleaner }