// Handles registration of a new user

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function Register(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    function handleSetUsername(e) {
        e.preventDefault();
        setUsername(e.target.value)
    }

    function handleSetPassword(e) {
        e.preventDefault();
        setPassword(e.target.value)
    }
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            var data = await axios.post("http://localhost:2814/users/register",
            {
                username: username,
                password: password
            });
            // Automatically logs user in on successful registration
            data = await axios.post("http://localhost:2814/users/login", {
                username: username,
                password: password
            });
            localStorage.setItem('token', data.data.token);
            props.setLoggedIn(true);
        } catch(e) {
            if (e.response.status === 400) {
                setMessage(e.response.data.message)
            } else {
                setMessage("An unknown error on registration")
            }
        }
    }

    if (props.loggedIn) {
        return (
            <Navigate to="/upload" />
        )
    } else {
        return (
            <div>
                <h4>{message}</h4>
                <br/>
                <input value={username} onChange={handleSetUsername} />
                <br/>
                <input value={password} type="password" onChange={handleSetPassword} />
                <br/>
                <button onClick={handleSubmit}>Register</button>
            </div>
        )
    }
}

export default Register;