import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Uploader from '../components/Uploader';

function Upload(props) {
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
                <Uploader />
            </div>
        )
    } else {
        return (
            <Navigate to="/login" />
        )
    }
}

export default Upload;