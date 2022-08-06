// Main view, showing the full comic collection, or filtered selection of comics

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router-dom';
import Comics from '../components/Comics';
import Search from '../components/Search';

function Catalogue(props) {
    const [comics, setComics] = useState();

    // Checks for received prefilled search terms if page is linked to with a direct search
    const location = useLocation();
    // console.log("Passed")
    // console.log(location.state)
    useEffect(() => {
        if (location.state) {
            getResponse(location.state.field, location.state.keyword)
        } else {
            fetch();
        }
    }, []);
    
    // Allows receiving search terms from the search element in order to perform the search filtering
    function getResponse(field, keyword) {
        var search = {
            field: field,
            keyword: keyword
        }
        fetch(search);
    }

    // Populates the catologue view based on any selected filters
    async function fetch(search){
        const token = localStorage.getItem('token')
        var response = await axios.get('http://34.244.147.208:2814/files/comics', {params: {token: token, search: search}});
        setComics(response.data)
    }

    if (props.loggedIn) {
        return (
            <div >
                <Search search={getResponse} prefill={location.state}/>
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