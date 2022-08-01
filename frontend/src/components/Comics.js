// Creates the display area of comics on the catalogue view

import { Col, Row, Container } from "react-bootstrap";
import ComicCard from './ComicCard';

function Comics (props) {
    const comics = props.comics;

    if (comics) {
        return (
            <Container>
                <Row sm={12}>
                    {
                    comics.map(function(i, index) {
                        return (
                            <Col sm={2} key={index} className="comicLibrary pt-2">
                                <ComicCard comic={i} />
                            </Col>
                        )
                    })
                    }
                </Row>
            </Container>
        )
    }
}

export default Comics;