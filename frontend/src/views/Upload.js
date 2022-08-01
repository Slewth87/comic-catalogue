// Page for uploading new comics

import { Navigate } from 'react-router-dom';
import Uploader from '../components/Uploader';

function Upload(props) {

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