import axios from 'axios';
import { useState} from 'react';

function Uploader() {
    const [file, setFile] = useState();
    const [message, setMessage] = useState('');

    function handleSelection(e) {
        e.preventDefault();
        setFile(e.target.files[0]);
        console.log(e.target.files[0])
    }

    async function handleUpload(e) {
        e.preventDefault();
        console.log("howdy")
        const token = localStorage.getItem('token')
        const formData = new FormData();
        formData.append('comicFile', file);
        const config = {
          headers: {
            'content-type': 'multipart/form-data',
          },
        };
        try {
            console.log("data:")
            var data = await axios.post("http://localhost:2814/files/upload?token="+token, formData, config);
            if (data.status === 204) {
                setMessage("No file selected")
            } else {
                setMessage(data.data);
            }
            console.log("message: " + data.data);
            console.log("status: " + data.status);
            console.log("and then");
        } catch (e) {
            console.log(e);
            if (e.response.data) {
                console.log("henlo")
                setMessage(e.response.data)
            } else {
                console.log("hi")
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