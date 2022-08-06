// User login page

import { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

function Login(props) {
    const [message, setMesage] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function handleUsernameInput(e) {
        e.preventDefault();
        setUsername(e.target.value);
    }

    function handlePasswordInput(e) {
        e.preventDefault();
        setPassword(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            var data = await axios.post("http://34.244.147.208:2814/users/login", {
                username: username,
                password: password
            })
            localStorage.setItem('token', data.data.token)
            props.setLoggedIn(true)
            setUsername("");
            setPassword("");
        } catch (e) {
            if (e.response.status === 400) {
                setMesage(e.response.data.message)
            } else {
                setMesage("An unknown error occured")
            }
        }
    }

    if (props.loggedIn) {
        return (
            <Navigate to="/" />
        )
    } else {
        return (
            <div>
                <h4>{message}</h4>
                <br/>
                <input value={username} onChange={handleUsernameInput} />
                <br/>
                <input value={password} type="password" onChange={handlePasswordInput} />
                <br/>
                <button onClick={handleSubmit} >Login</button>
            </div>
        )
    }
}

export default Login;