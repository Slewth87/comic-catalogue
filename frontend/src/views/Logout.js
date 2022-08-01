// Clears the token and login state, then navigates back to the login view

import { Navigate } from 'react-router-dom';

function Logout(props) {
    localStorage.setItem("token", "")
    props.setLoggedIn(false)
    return (
        <Navigate to="/login" />
    )
}

export default Logout;