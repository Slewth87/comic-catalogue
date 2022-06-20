import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

function Catalogue(props) {
    const [username, setUsername] = useState('');

    useEffect(() => {
        async function fetch() {
            const token = localStorage.getItem('token')

            var data = await axios.get("http://localhost:2814/users/user", {params: {token: token}})
            setUsername(data.data.username)
        }
        fetch();
    }, []);

    if (props.loggedIn) {
        return (
            <div>
                <h2>{username}'s Catalogue</h2>
            </div>
        )
    } else {
        return (
            <Navigate to="/login" />
        )
    }
}

export default Catalogue;