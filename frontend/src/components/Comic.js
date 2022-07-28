import { Card, Col, Row, Container, ButtonGroup, Button } from 'react-bootstrap';
import fileDownload from 'js-file-download';
import { useState } from 'react';
import axios from 'axios';
import Deletion from './Deletion';

function Comic(props) {
    const [modalShow, setModalShow] = useState(false);
    console.log("alanis")
    console.log(props)
    const comic = props.comic;
    const token = localStorage.getItem('token');
    // const temp = JSON.stringify(comic)
    var month;

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

    async function download() {
        var download = await axios.get("http://localhost:2814/files/downloads", {params: { token: token, file: comic.comic_file }});
        var file = download.data.file.split("/").pop();
        await axios.get("http://localhost:2814" + download.data.file, {responseType: 'blob', onDownloadProgress: (loading) => {
            var completion = Math.round((loading.loaded * 100) / loading.total)
            if (completion === 100) {
                console.log("tada")
                axios.delete("http://localhost:2814/files/downloads", {params: { token: token, file: download.data.file }});
            }
        }
        }).then(res => {
            fileDownload(res.data, file);
        })
    }

    function deleter(e) {
        // e.preventDefault();
        setModalShow(true);
    }

    if (comic) {
        return (
            <div>
                <Deletion
                show={modalShow}
                comic={comic}
                onHide={() => setModalShow(false)}
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
                                        <Button variant="outline-success">Edit</Button>
                                        <Button variant="success" onClick={download}>Download</Button>
                                        <Button variant="danger" onClick={deleter}>Delete</Button>
                                    </ButtonGroup>
                                </Row>
                            </Col>
                            <Col>
                                <Row>
                                    <h2>{comic.series} Vol. {comic.volume} #{comic.issue_number} {comic.count ? "(of " + comic.count + ")" : ""}</h2>
                                </Row>
                                <Row>
                                    <h2>{comic.alternate_series ? comic.alternate_series : ""}</h2>
                                </Row>
                                <Row>
                                    <h3>{comic.title}</h3>
                                </Row>
                                <Row>
                                    <h5>{month} {(comic.publication).split("-")[0]}</h5>
                                </Row>
                                <Row>
                                    <Col>
                                        <Row>
                                            { comic.writer ? "Written by: " + comic.writer : ""}
                                        </Row>
                                        <Row>
                                            { comic.penciller ? "Pencils: " + comic.penciller : ""}
                                        </Row>
                                        <Row>
                                            { comic.inker ? "Inks by: " + comic.inker : ""}
                                        </Row>
                                        <Row>
                                            { comic.colorist ? "Colours: " + comic.colorist : ""}
                                        </Row>
                                        <Row>
                                            { comic.letterer ? "Letterer: " + comic.letterer : ""}
                                        </Row>
                                        <Row>
                                            { comic.cover_artist ? "Cover Art: " + comic.cover_artist : ""}
                                        </Row>
                                        <Row>
                                            { comic.editor ? "Edited by: " + comic.editor : ""}
                                        </Row>
                                    </Col>
                                    <Col>
                                        <Row>
                                            Published by { comic.imprint ? comic.imprint : comic.publisher }
                                        </Row>
                                        <Row>
                                            {comic.imprint ? "for " + comic.publisher : ""}
                                            <br/>
                                            <br/>
                                        </Row>
                                        <Row>
                                            {comic.genre ? "Genre: " + comic.genre : ""}
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <h5>{comic.summary ? "Summary" : ""}</h5>
                                    {comic.summary ? comic.summary : ""}
                                </Row>
                                <Row>
                                    <h5>{comic.characters ? "Featuring:" : ""}</h5>
                                    {comic.characters ? comic.characters : ""}
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