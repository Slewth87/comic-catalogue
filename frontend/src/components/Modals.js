import axios from 'axios';
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import ImageFlipper from './ImageFlipper.js';
import { Carousel } from 'react-bootstrap';

function Modals(props) {
  // const [comicInfo, setComicInfo] = useState('')
  const comicInfo = props.comicinfo;
  console.log(props.comicinfo);

  // handles adding a new game to the db
  async function handleAdd() {
    await axios.post("http://localhost:8080/games", {name: props.title, release: props.release, platform: props.platform, rating: props.rating, notes: props.notes, img: props.img})
    .then(function (response) {
    console.log(response);
    console.log("Game added successfully")
    // Redirect to the home page where the games library can be viewed, with its new addition
    window.location.replace("/");
    })
    .catch(function (error) {
    console.log(error);
    alert("Failed to add game. Try again later.")
    })
    // Close the modal
    props.onHide();
  }

  // Modal to confirm the addition of a new game to the library
  if (comicInfo) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="text-light"
      >
        <Modal.Header closeButton className="bg-dark">
          <Modal.Title id="contained-modal-title-vcenter">
            Add {comicInfo.Series} #{comicInfo.Number} to your catalogue
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
        <Form>
          <Row>
            <Col className="md-3 col-3" controlId="formThumb">
              <Form.Label>Thumbnail</Form.Label>
              <Carousel interval={null}>
              {
                  comicInfo.Pages.map(function(i, index) {
                      return (
                        <Carousel.Item key={index}>
                          <ImageFlipper images={comicInfo.Pages} count={comicInfo.PageCount} number={i}/>
                        </Carousel.Item>
                      )
                  })
                  }
              </Carousel>
            </Col>
            <Col>
              <Row>
                <Form.Group className="mb-3 col" controlId="formSeries">
                  <Form.Label>Series</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.Series} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formAlternateSeries">
                  <Form.Label>Storyline</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.AlternateSeries} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group className="mb-3 col" controlId="formVolume">
                  <Form.Label>Volume</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.Volume} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formIssueNo">
                  <Form.Label>Issue</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.Number} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formCount">
                  <Form.Label>Count (if limited series)</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.Count} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group className="mb-3 col" controlId="formTitle">
                  <Form.Label>Stories ("/" separated)</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.Title} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formGenre">
                  <Form.Label>Genre</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.Genre} />
                </Form.Group>
              </Row>
              <Row>
                Fields marked with a * are comma separated
              </Row>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formCharacters">
              <Form.Label>Characters*</Form.Label>
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.Characters} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formSummary">
              <Form.Label>Summary</Form.Label>
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.Summary} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.Notes} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formBasicWriter">
              <Form.Label>Writer*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Writer} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formPenciller">
              <Form.Label>Penciller*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Penciller} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formEditor">
              <Form.Label>Editor*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Editor} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formInker">
              <Form.Label>Inker*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Inker} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formColorist">
              <Form.Label>Colorist*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Colorist} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formLetterer">
              <Form.Label>Letterer*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Letterer} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formCoverArtist">
              <Form.Label>Cover Artist*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.CoverArtist} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formPublisher">
              <Form.Label>Publisher</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Publisher} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formImprint">
              <Form.Label>Imprint</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.Imprint} />
            </Form.Group>
          </Row>
        </Form>
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="outline-success" onClick={props.onHide}>Cancel</Button>
          <Button variant="success" onClick={handleAdd}>Save</Button>
        </Modal.Footer>
      </Modal>
    )
  } else {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="text-light"
      >
        <Modal.Header closeButton className="bg-dark">
          <Modal.Title id="contained-modal-title-vcenter">
            Henlo
          </Modal.Title>
        </Modal.Header></Modal>
    )
  }
}

export default Modals;