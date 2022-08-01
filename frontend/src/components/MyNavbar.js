// Builds the navbar for the site

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo64 from '../images/logo64.png';
import { Navbar, Nav, Container } from "react-bootstrap";

function MyNavbar(props) {
    const [loggedIn, setLoggedIn] = useState(false)

    // Confirms the login state to determine which navbar to display
    useEffect(function() {
        if (props.loggedIn) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [props.loggedIn])

    if (loggedIn) {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/"><img src={logo64} height="30" alt="Comic logo"/>Comic Catalogue</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto align-items-end">
                            <Nav.Link as={Link} to={{pathname: "/", state: { props: loggedIn}}}>Catalogue</Nav.Link>
                            <Nav.Link as={Link} to={{pathname: "/upload", state: { props: loggedIn}}}>Upload Comic</Nav.Link>
                            <Nav.Link as={Link} to={{pathname: "/logout", state: { props: loggedIn}}}>Logout</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    } else {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand href="/"><img src={logo64} height="30" alt="Comic logo"/>Comic Catalogue</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="ms-auto align-items-end">
                            <Nav.Link as={Link} to={{pathname: "/register", state: { props: loggedIn},}}>Register</Nav.Link>
                            <Nav.Link as={Link} to={{pathname: "/login", state: { props: loggedIn},}}>Login</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    }
}

export default MyNavbar;