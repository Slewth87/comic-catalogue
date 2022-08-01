// Builds the comic card for displaying a single comic

import { Card, Col, Row, Container, ButtonGroup, Button } from 'react-bootstrap';
import fileDownload from 'js-file-download';
import { useState } from 'react';
import axios from 'axios';
import Deletion from './Deletion';
import Modals from './Modals.js'
import { Link } from 'react-router-dom';

function Comic(props) {
    const [deleteShow, setDeleteShow] = useState(false);
    const [editShow, setEditShow] = useState(false);
    const [file, setFile] = useState();
    const comic = props.comic;
    const token = localStorage.getItem('token');
    var month;

    // Converts numerical month to month name for display
    if ((props.comic.publication).split("-")[1] === "01") {
        month = "January";
    } else if ((props.comic.publication).split("-")[1] === "02") {
        month = "February";
    } else if ((props.comic.publication).split("-")[1] === "03") {
        month = "March";
    } else if ((props.comic.publication).split("-")[1] === "04") {
        month = "April";
    } else if ((props.comic.publication).split("-")[1] === "05") {
        month = "May";
    } else if ((props.comic.publication).split("-")[1] === "06") {
        month = "June";
    } else if ((props.comic.publication).split("-")[1] === "07") {
        month = "July";
    } else if ((props.comic.publication).split("-")[1] === "08") {
        month = "August";
    } else if ((props.comic.publication).split("-")[1] === "09") {
        month = "September";
    } else if ((props.comic.publication).split("-")[1] === "10") {
        month = "October";
    } else if ((props.comic.publication).split("-")[1] === "11") {
        month = "November";
    } else if ((props.comic.publication).split("-")[1] === "12") {
        month = "December";
    }

    // Allows a comic file to be downloaded
    async function download() {
        var download = await axios.get("http://localhost:2814/files/downloads", {params: { token: token, file: comic.comic_file }});
        var file = download.data.file.split("/").pop();
        await axios.get("http://localhost:2814" + download.data.file, {responseType: 'blob', onDownloadProgress: (loading) => {
            var completion = Math.round((loading.loaded * 100) / loading.total)
            // Deletes the temporarily generated download file once the download has completed
            if (completion === 100) {
                axios.delete("http://localhost:2814/files/downloads", {params: { token: token, file: download.data.file }});
            }
        }
        }).then(res => {
            fileDownload(res.data, file);
        })
    }

    // Calls a confirmation modal before deleting a comic book
    function deleter(e) {
        // e.preventDefault();
        setDeleteShow(true);
    }

    // Cleans up temp files on the back end when closing the editing modal
    async function closer(button) {
        setDeleteShow(false);
        setEditShow(false);
        const token = localStorage.getItem('token');
        var original = comic.comic_file.split("/").pop()
        var temp = "./tmp/" + original.split(".")[0] + "-" + comic.user_id
        var moved = "./uploads/" + original.split(".")[0] + ".zip"
        // console.log("upload");
        // console.log(moved)
        // console.log("tmp")
        // console.log(temp)
        // console.log(comic.comic_file);
        // Behaviour of how to handle files on Save is the same as the handling of saving a newly uploaded file
        if (button === "save") {
            axios.get("http://localhost:2814/files/cleaner", {params:{token: token, tmp: temp, upload: moved, source: "save"}})
            console.log("Saved")
        } else {
            axios.get("http://localhost:2814/files/cleaner", {params:{token: token, tmp: temp, upload: moved, source: "cancel"}})
            console.log("Cancelled")
        }
    }

    // Sets up temp files on the backend which will be manipulated on saving
    async function prep() {
        const token = localStorage.getItem('token');
        var data = await axios.get("http://localhost:2814/files/prep", {params:{token: token, comic: comic}})
        await setFile(data.data.comic)
        setEditShow(true);
    }

    if (comic) {
        // Create arrays for rendering multiple links to different searches back in the catalogue view
        if (comic.writer) {
            var writer = comic.writer.split(", ")
        }
        if (comic.penciller) {
            var penciller = comic.penciller.split(", ")
        }
        if (comic.inker) {
            var inker = comic.inker.split(", ")
        }
        if (comic.colorist) {
            var colorist = comic.colorist.split(", ")
        }
        if (comic.letterer) {
            var letterer = comic.letterer.split(", ")
        }
        if (comic.cover_artist) {
            var cover_artist = comic.cover_artist.split(", ")
        }
        if (comic.editor) {
            var editor = comic.editor.split(", ")
        }
        if (comic.characters) {
            var characters = comic.characters.split(", ")
        }
        return (
            <div>
                <Deletion
                show={deleteShow}
                comic={comic}
                onHide={() => setDeleteShow(false)}
                />
                <Modals
                show={editShow}
                comicInfo={file}
                id={comic.id}
                source="edit"
                onHide={(button) => closer(button)}
                />
                <Card className="comic-view bg-dark text-light">
                    {/* {temp} */}
                    <Container>
                        <Row>
                            <Col md="auto">
                                <Row>
                                    <img className="comic-thumb" src={"http://localhost:2814"+comic.thumbnail} alt={comic.series + " Volume " + comic.volume + " Issue " + comic.issue_number} width="300"/>
                                </Row>
                                <Row>
                                    <ButtonGroup vertical className="comic-buttons">
                                        {/* <Button variant="success">View</Button> */}
                                        <Button variant="outline-success" onClick={prep}>Edit</Button>
                                        <Button variant="success" onClick={download}>Download</Button>
                                        <Button variant="danger" onClick={deleter}>Delete</Button>
                                    </ButtonGroup>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <h2>{comic.series ? <Link to="/" state={{field: "Series", keyword: comic.series}}>{comic.series}</Link> : ""} {comic.volume ? "Vol. " + comic.volume : ""} {comic.issue_number ? "#" + comic.issue_number : ""} {comic.count ? "(of " + comic.count + ")" : ""}</h2>
                                </Row>
                                <Row>
                                    <h2>{comic.alternate_series ? <Link to="/" state={{field: "Series", keyword: comic.alternate_series}}>{comic.alternate_series}</Link> : ""}</h2>
                                </Row>
                                <Row>
                                    <h3>{comic.title}</h3>
                                </Row>
                                <Row>
                                    <h5>{month} {comic.publication ? <Link to="/" state={{field: "Year", keyword: (comic.publication).split("-")[0]}}>{(comic.publication).split("-")[0]}</Link> : ""}</h5>
                                </Row>
                                <Row>
                                    <Col>
                                        <Row>
                                            <ul>
                                                { comic.writer ? "Written by: " : "" }{
                                                    writer.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== writer.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.penciller ? "Pencils: " : "" }{
                                                    penciller.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== penciller.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.inker ? "Inks by: " : "" }{
                                                    inker.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== inker.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.colorist ? "Colours: " : "" }{
                                                    colorist.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== colorist.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.letterer ? "Letterer: " : "" }{
                                                    letterer.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== letterer.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                                </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.cover_artist ? "Cover Art: " : "" }{
                                                    cover_artist.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== cover_artist.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                        <Row>
                                            <ul>
                                                { comic.editor ? "Edited by: " : "" }{
                                                    editor.map(function(i, index) {
                                                        return (
                                                            <li key={index} className="characterList" >
                                                                <Link to="/" state={{field: "Creator", keyword: i}}>{i}</Link>{index !== editor.length-1 ? ", " : ""}
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row>
                                            Published by { comic.imprint ? <Link to="/" state={{field: "Imprint", keyword: comic.imprint}}>{comic.imprint}</Link> : <Link to="/" state={{field: "Publisher", keyword: comic.publisher}}>{comic.publisher}</Link> }
                                        </Row>
                                        <Row>
                                            {comic.imprint ? "for " : ""}{comic.imprint ? <Link to="/" state={{field: "Publisher", keyword: comic.publisher}}>{comic.publisher}</Link> : ""}
                                            <br/>
                                            <br/>
                                        </Row>
                                        <Row>
                                        {comic.genre ? "Genre " : ""}{comic.genre ? <Link to="/" state={{field: "Genre", keyword: comic.genre}}>{comic.genre}</Link> : ""}
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <h5>{comic.summary ? "Summary" : ""}</h5>
                                    {comic.summary ? comic.summary : ""}
                                </Row>
                                <Row>
                                    <h5>{comic.characters ? "Featuring:" : ""}</h5>
                                    <ul>
                                    {
                                        characters.map(function(i, index) {
                                            return (
                                                <li key={index} className="characterList" >
                                                    <Link to="/" state={{field: "Character", keyword: i}}>{i}</Link>{index !== characters.length-1 ? ", " : ""}
                                                </li>)
                                        })
                                    }
                                    </ul>
                                </Row>
                                <Row>
                                    <h5>{comic.notes ? "Notes:" : ""}</h5>
                                    {comic.notes ? comic.notes : ""}
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Card>
            </div>
        )
    } else {
        <div>
            No luck
        </div>
    }
}

export default Comic;