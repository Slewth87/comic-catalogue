// Creates the cards to display comics in the Catalogue view

import { Card } from "react-bootstrap";
import { Link } from 'react-router-dom';

function ComicCard(props) {
    var thumbnail = "http://localhost:2814" + props.comic.thumbnail;
    var reference = props.comic.id;
    var month;
    // Sets the month value to display, dropping the 0 at the start if one of the first 9 months
    if ((props.comic.publication).split("-")[1].charAt(0) === "0") {
        month = (props.comic.publication).split("-")[1].charAt(1)
    } else {
        month = (props.comic.publication).split("-")[1]
    }

    
    return (
        <Card bg="dark" text="light" className="h-100 catalog-comic" as={Link} to={{pathname: "/comic/"+reference }} id={reference}>
            <Card.Img variant="top" src={thumbnail} />
            <Card.Body className="d-flex flex-column">
                <Card.Title>{props.comic.series ? props.comic.series : ""}{!props.comic.series ? props.comic_file : ""} {props.comic.volume ? "v" + props.comic.volume : ""} {props.comic.issue_number ? "#" + props.comic.issue_number : ""}</Card.Title>
                <Card.Text>
                    {(props.comic.publication).split("-")[0]}/{month}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default ComicCard;