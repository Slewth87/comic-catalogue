import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Comics from '../components/Comics';
import Search from '../components/Search';

function Catalogue(props) {
    // const [user, setUser] = useState('');
    const [comics, setComics] = useState();
    // const [field, setField] = useState('');
    // const [keyword, setKeyword] = useState('');
    // var load = 0;

    useEffect(() => {
        fetch();
    }, []);
    
    function getResponse(field, keyword) {
        var search = {
            field: field,
            keyword: keyword
        }
        fetch(search);
    }

    async function fetch(search){
        const token = localStorage.getItem('token')
        var response = await axios.get('http://localhost:2814/files/comics', {params: {token: token, search: search}});
        setComics(response.data)
    }

    if (props.loggedIn) {
        return (
            <div >
                <Search search={getResponse} />
                <Comics comics={comics} />
            </div>
        )
    } else {
        return (
            <Navigate to="/login" />
        )
    }
}

export default Catalogue;