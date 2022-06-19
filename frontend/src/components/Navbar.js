import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar(props) {
    const [loggedIn, setLoggedIn] = useState(false)
    useEffect(function() {
        if (props.loggedIn) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [props.loggedIn])
    if (loggedIn) {
        return (
            <nav>
                <Link to="/">Catalogue</Link>
                <Link to="/upload">Upload</Link>
                <Link to="/logout">Logout</Link>
            </nav>
        )
    } else {
        return (
            <nav>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
            </nav>
        )
    }
}

export default Navbar;