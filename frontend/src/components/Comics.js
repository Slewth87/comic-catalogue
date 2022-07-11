import { useState } from 'react';
import { Col, Row, Container } from "react-bootstrap";
import axios from 'axios';
import Comic from './Comic';

function Comics () {
    const [comics, setComics] = useState([]);
    const [load, setLoad] = useState(true);

    // Automatically loads the games when page first opened
    if (load) {
        refresher();
        setLoad(false);
    }

    // call to get the game details to display
    async function refresher(){
        const token = localStorage.getItem('token')
        var response = await axios.get('http://localhost:2814/files/comics', {params: {token: token}});
        setComics(response.data)
    }

    return (
        <Container>
            <Row sm={12}>
                {
                comics.map(function(i, index) {
                    return (
                        <Col sm={3} key={index} className="comicLibrary pt-2">
                            <Comic comic={i} />
                        </Col>
                    )
                })
                }
            </Row>
        </Container>
    )
}

export default Comics;