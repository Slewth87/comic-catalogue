import axios from 'axios';
import { useState} from 'react';
import Modals from './Modals.js'

function Uploader() {
    const [file, setFile] = useState();
    const [message, setMessage] = useState('');
    const [comicInfo, setComicInfo] = useState('');
    const [modalShow, setModalShow] = useState(false);

    function handleSelection(e) {
        e.preventDefault();
        setFile(e.target.files[0]);
        console.log(e.target.files[0])
    }

    async function closer() {
        setModalShow(false);
        const token = localStorage.getItem('token');
        console.log("appeared");
        console.log(file.name);
        console.log(comicInfo.location);
        axios.get("http://localhost:2814/files/cleaner", {params:{token: token, tmp: comicInfo.location, upload: file.name}})
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
                setMessage(data.data.message);
                setComicInfo(data.data.comic);
                setModalShow(true);
            }
            console.log(data)
            console.log("message: " + data.data.message);
            console.log("status: " + data.status);
            console.log("comic");
            console.log(data.data.comic);
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
            <Modals
            show={modalShow}
            comicinfo={comicInfo}
            onHide={() => closer()}
            />
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