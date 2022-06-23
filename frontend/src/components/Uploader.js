import axios from 'axios';
import { useState} from 'react';

function Uploader() {
    const [file, setFile] = useState();
    const [message, setMessage] = useState('');

    function handleSelection(e) {
        e.preventDefault();
        setFile(e.target.files[0]);
    }

    async function handleUpload(e) {
        e.preventDefault();
        const token = localStorage.getItem('token')
        const formData = new FormData();
        formData.append('comicFile', file);
        const config = {
          headers: {
            'content-type': 'multipart/form-data',
          },
        };
        try {
            var data = await axios.post("http://localhost:2814/files/upload?token="+token, formData, config);
            setMessage(data.data.message);
            console.log(e.response);
        } catch (e) {
            if (e.response.data.message) {
                setMessage(e.response.data.message)
            } else {
                setMessage("An unknown error on upload")
            }
        }
        };

    return (
        <div>
            <form>
                <h2>Upload file</h2>
                <input type="file" onChange={handleSelection} />
                <button type="submit" onClick={handleUpload} >Upload</button>
            </form>
            <h2>{message}</h2>
       </div>
    )
}

export default Uploader;