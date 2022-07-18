import { Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

function Search (props) {
    const [field, setField] = useState("");
    const [possible, setPossible] = useState([]);

    function handleField(e) {
        setField(e.target.value);
        populate(e.target.value);
        var selector = document.querySelector('#keywords')
        selector.value = "home"
    }

    function handleTerm(e) {
        e.preventDefault();
        props.search(field, e.target.value);
    }

    async function populate(possibles) {
        const token = localStorage.getItem('token')
        var long = "";
        var possible = await axios.get('http://localhost:2814/files/comicsfields', {params: {token: token, field: possibles}});
        var categories = Object.keys(possible.data[0])

        for (let i=0;i<possible.data.length;i++) {
            for (let j=0;j<categories.length;j++) {
                if (possibles === "Year") {
                    long = long + possible.data[i][categories[j]].split("-")[0]
                } else {
                    long = long + possible.data[i][categories[j]]
                }
                if (j < categories.length - 1) {
                        long = long + ", "
                }
            }
            if (i < possible.data.length - 1) {
                long = long + ", "
            }
        }
        var normalised = [...new Set(long.split(", "))]
        var filtered = normalised.filter(element => {
            return element !== "null";
        })
        setPossible(filtered.sort());
    }

    function clear() {
        window.location.reload();
    }

    return (
        <Form className="display-comic buffer" as={Row} >
            <Form.Group as={Col} >
                <Form.Select placeholder="All" onChange={handleField} >
                    <option>All</option>
                    <option>Series</option>
                    <option>Character</option>
                    <option>Creator</option>
                    <option>Artist</option>
                    <option>Writer</option>
                    <option>Inker</option>
                    <option>Penciller</option>
                    <option>Colorist</option>
                    <option>Letterer</option>
                    <option>Editor</option>
                    <option>Cover Artist</option>
                    <option>Genre</option>
                    <option>Year</option>
                    <option>Publisher</option>
                    <option>Imprint</option>
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} >
                <Form.Select onChange={handleTerm} id="keywords">
                    <option value="home" disabled>Select. . .</option>
                    {
                        possible.map(function(i, index) {
                            return (
                                <option key={index}>{i}</option>
                            )
                        })
                    }
                </Form.Select>
            </Form.Group>
                <Button as={Col} md="3" variant="outline-success" onClick={clear} >Clear</Button>
        </Form>
    )
}

export default Search;