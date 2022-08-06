// Modal to alert when attempting to upload a duplicate file

import { Modal, Button } from "react-bootstrap";
import { Link } from 'react-router-dom';

function Check(props) {
    if (props.filecheck) {
        // console.log("props.filecheck")
        // console.log(props.filecheck)
        var dupeID = props.filecheck.id;
        // console.log("dupeID")
        // console.log(dupeID)

        return (
            <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="text-light">
                <Modal.Header className="bg-dark">
                    <Modal.Title>
                        Duplicate file detected
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark">
                    Either edit the details of this existing entry:
                    <ul>
                        {
                            // data comes in an array, only expected to have one result, but allowing for more.
                            dupeID.map(function(i, index) {
                                return (
                                    <li key={index}><Link to={"/comic/" + i} onClick={props.closer()}>{props.filecheck.name}</Link></li>
                                )
                            })
                        }
                    </ul>
                    Or edit the details of the current upload.
                </Modal.Body>
                <Modal.Footer className="bg-dark">
                    <Button variant="success" onClick={props.onHide}>Ok</Button>
                </Modal.Footer>
            </Modal>
        )
}
}

export default Check;