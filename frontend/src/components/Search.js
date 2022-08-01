// Builds the search bar for filtering the comic collection

import { Form, Button, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';

function Search (props) {
    const [field, setField] = useState("");
    const [possible, setPossible] = useState([]);
    const selectors = ["All", "Series", "Character", "Creator", "Artist", "Writer", "Inker", "Penciller", "Colorist", "Letterer", "Editor", "Cover Artist", "Genre", "Year", "Publisher", "Imprint"]
    const [prefill, setPrefill] = useState(false)

    // Allows for populating values if this page is being loaded due to a clicked link specifying a particular value to look up
    // Use of prefill value prevents constant re-rendering of State
    if (!prefill) {
        setPrefill(true);
        if (props.prefill) {
            setField(props.prefill.field);
            populate(props.prefill.field);
        }
    }

    // Handles making a selection of a field to search
    function handleField(e) {
        console.log("tried it")
        e.preventDefault()
        setField(e.target.value);
        populate(e.target.value);
        // Resets the search term when a new search field is selected
        var selector = document.querySelector('#keywords')
        selector.value = "home"
    }

    // Handles the selection of a search term
    function handleTerm(e) {
        e.preventDefault();
        //performs a search with the passed details
        props.search(field, e.target.value);
    }

    // populates the list of possible search terms based on selected search field
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

    // Refreshes the page to clear all states when Clear button is used
    function clear() {
        window.location.reload();
    }
    
    return (
        <Form className="display-comic buffer" as={Row}>
            <Form.Group as={Col} >
                <Form.Select onChange={handleField}>
                    {
                        selectors.map(function(i, index) {
                            // Sets the selected Field if a prefill is passed from linking directly to a particular search
                            var selector = false;
                            if (props.prefill) {
                                if (props.prefill.field === i) {
                                    selector = true;
                                }
                            }
                            return (
                                <option key={index} selected={selector}>{i}</option>
                            )
                        })
                    }
                </Form.Select>
            </Form.Group>
            <Form.Group as={Col} >
                <Form.Select onChange={handleTerm} id="keywords">
                    <option value="home" disabled>Select. . .</option>
                    {
                        possible.map(function(i, index) {
                            // Sets the selected search term if a prefill is passed from linking directly to a particular search
                            var selection = false;
                            if (props.prefill) {
                                if (props.prefill.keyword === i) {
                                    selection = true;
                                }
                            }
                            return (
                                <option key={index} selected={selection}>{i}</option>
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