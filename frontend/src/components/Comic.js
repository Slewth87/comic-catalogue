import { useState } from 'react';
import { Card, Button, ButtonGroup, Col } from "react-bootstrap";

function Comic(props) {
    console.log("Props:")
    console.log(props)
    var thumbnail = "http://localhost:2814" + props.comic.thumbnail;

    console.log(thumbnail)
    return (
        <Card className="h-100">
            <Card.Img variant="top" src={thumbnail} />
            <Card.Body className="d-flex flex-column">
                <Card.Title>{props.comic.series} v{props.comic.volume} #{props.comic.issue_number}</Card.Title>
                <Card.Text>
                    {props.comic.publication_month}/{props.comic.publication_year}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default Comic;