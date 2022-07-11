import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Comics from '../components/Comics';

function Catalogue(props) {
    const [user, setUser] = useState('');

    useEffect(() => {
        async function fetch() {
            const token = localStorage.getItem('token')

            var data = await axios.get("http://localhost:2814/users/user", {params: {token: token}})
            setUser(data.data.id)
        }
        fetch();
    }, []);

    if (props.loggedIn) {
        return (
            <div>
                <Comics user={user} />
            </div>
        )
    } else {
        return (
            <Navigate to="/login" />
        )
    }
}

export default Catalogue;