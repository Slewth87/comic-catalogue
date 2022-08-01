// Confirmation modal for deleting a comic

import { Modal, Button, ButtonGroup } from "react-bootstrap";
import axios from 'axios';

function Deletion(props) {
    const comic = props.comic;
    var message;

    // Sets the message based on how much comic info is available
    if (comic.series) {
        if (comic.issue_number) {
            if (comic.volume) {
                message = "Are you sure you want to delete " + comic.series + " vol." + comic.volume + " #" + comic.issue_number + "?"
            } else {
                message = "Are you sure you want to delete " + comic.series + " #" + comic.issue_number + "?"
            }
        } else {
            message = "Are you sure you want to delete this issue of " + comic.series + "?"
        }
    } else {
        message = "Are you sure you want to delete this comic?"
    }

    // Deletes the comic from the collection if deletion confirmed
    async function wipeIt() {
        const token = localStorage.getItem('token')
        let wiper = {
            id: comic.id,
            file: comic.comic_file,
            thumbnail: comic.thumbnail
        }
        console.log(wiper);
        console.log(token);
        var result = await axios.delete("http://localhost:2814/files/comics", {params: {token: token, comic: wiper}})
        console.log(result)
        window.location.replace("/");
    }

    return (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className="text-light"
        >
            <Modal.Title className="bg-dark">
                {message}
            </Modal.Title>
            <Modal.Footer className="bg-dark">
                <ButtonGroup>
                    <Button onClick={props.onHide} variant="outline-danger">No</Button>
                    <Button onClick={wipeIt} variant="danger">Yes</Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
    )
}

export default Deletion;