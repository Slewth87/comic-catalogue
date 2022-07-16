import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Comic from '../components/Comic'

function ComicView() {
    const comicId = useParams().id;
    const [comic, setComic] = useState();

    useEffect(() => {
        async function fetch() {
            const token = localStorage.getItem('token')
            var response = await axios.get('http://localhost:2814/files/comics', {params: {token: token, id: comicId}});
            setComic(response.data[0])
        }
        fetch();
    }, []);

    if (comic) {
        console.log("borb")
        console.log(comic)
        return (
            <div className="display-comic">
                <Link to="/">← Back</Link>
                <Comic comic={comic}/>
            </div>
        )
    } else {
        return (
            <div>
                Loading. . .
            </div>
        )
    }
}

export default ComicView;