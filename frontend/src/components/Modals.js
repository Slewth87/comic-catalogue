import axios from 'axios';
import { Modal, Button, Form, Col, Row } from "react-bootstrap";
import ImageFlipper from './ImageFlipper.js';
import { Carousel } from 'react-bootstrap';
import { useState } from 'react'

function Modals(props) {
  const comicInfo = props.comicinfo;
  console.log(props.comicinfo);
  const [title, setTitle] = useState('');
  const [series, setSeries] = useState('');
  const [number, setNumber] = useState();
  const [count, setCount] = useState();
  const [volume, setVolume] = useState(1);
  const [alternateSeries, setAlternateSeries] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [year, setYear] = useState();
  const [month, setMonth] = useState();
  const [writer, setWriter] = useState([]);
  const [penciller, setPenciller] = useState([]);
  const [inker, setInker] = useState([]);
  const [colorist, setColorist] = useState([]);
  const [letterer, setLetterer] = useState([]);
  const [coverArtist, setCoverArtist] = useState([]);
  const [editor, setEditor] = useState([]);
  const [publisher, setPublisher] = useState('');
  const [imprint, setImprint] = useState('');
  const [genre, setGenre] = useState('');
  const [pageCount, setPageCount] = useState(1);
  const [format, setFormat] = useState('');
  const [characters, setCharacters] = useState([]);
  const [thumb, setThumb] = useState('');
  const [location, setLocation] = useState('');
  const [pages, setPages] = useState();

  // handles adding a new game to the db
  async function handleAdd() {
    const token = localStorage.getItem('token')
    await axios.post("http://localhost:2814/files/save", {params: {
      title: title,
      series: series,
      number: number,
      count: count,
      volume: volume,
      alternateSeries: alternateSeries,
      summary: summary,
      notes: notes,
      year: year,
      month: month,
      writer: writer,
      penciller: penciller,
      inker: inker,
      colorist: colorist,
      letterer: letterer,
      coverArtist: coverArtist,
      editor: editor,
      publisher: publisher,
      imprint: imprint,
      genre: genre,
      pageCount: pageCount,
      format: format,
      characters: characters,
      pages: pages,
      location: location,
      thumb: thumb,
      token: token
    }})
    .then(function (response) {
    console.log(response);
    console.log("Comic added successfully")
    // Redirect to the home page where the games library can be viewed, with its new addition
    window.location.replace("/");
    })
    .catch(function (error) {
    console.log(error);
    alert("Failed to add comic. Try again later.")
    })
    // Close the modal
    props.onHide();
  }

  function addTitle(e) {
    e.preventDefault();
    setTitle(e.target.value)
  }

  function addSeries(e) {
    e.preventDefault();
    setSeries(e.target.value)
  }

  function addNumber(e) {
    e.preventDefault();
    setNumber(e.target.value)
  }

  function addCount(e) {
    e.preventDefault();
    setCount(e.target.value)
  }

  function addVolume(e) {
    e.preventDefault();
    setVolume(e.target.value)
  }

  function addAlternateSeries(e) {
    e.preventDefault();
    setAlternateSeries(e.target.value)
  }

  function addSummary(e) {
    e.preventDefault();
    setSummary(e.target.value)
  }

  function addNotes(e) {
    e.preventDefault();
    setNotes(e.target.value)
  }

  function addYear(e) {
    e.preventDefault();
    setYear(e.target.value)
  }

  function addMonth(e) {
    e.preventDefault();
    setMonth(e.target.value)
  }

  function addWriter(e) {
    e.preventDefault();
    setWriter(e.target.value)
  }

  function addPenciller(e) {
    e.preventDefault();
    setPenciller(e.target.value)
  }

  function addInker(e) {
    e.preventDefault();
    setInker(e.target.value)
  }

  function addColorist(e) {
    e.preventDefault();
    setColorist(e.target.value)
  }

  function addLetterer(e) {
    e.preventDefault();
    setLetterer(e.target.value)
  }

  function addCoverArtist(e) {
    e.preventDefault();
    setCoverArtist(e.target.value)
  }

  function addEditor(e) {
    e.preventDefault();
    setEditor(e.target.value)
  }

  function addPublisher(e) {
    e.preventDefault();
    setPublisher(e.target.value)
  }

  function addImprint(e) {
    e.preventDefault();
    setImprint(e.target.value)
  }

  function addGenre(e) {
    e.preventDefault();
    setGenre(e.target.value)
  }

  function addCharacters(e) {
    e.preventDefault();
    setCharacters(e.target.value)
  }

  function addThumb(e) {
    setThumb(e.target.value)
  }

  function loader() {
    if (thumb !== comicInfo.pages[0].source) {
      setTitle(comicInfo.title);
      setSeries(comicInfo.series);
      setNumber(comicInfo.number);
      setCount(comicInfo.count);
      setVolume(comicInfo.volume);
      setAlternateSeries(comicInfo.alternateSeries);
      setSummary(comicInfo.summary);
      setNotes(comicInfo.notes);
      setYear(comicInfo.year);
      setMonth(comicInfo.month);
      setWriter(comicInfo.writer);
      setPenciller(comicInfo.penciller);
      setInker(comicInfo.inker);
      setColorist(comicInfo.colorist);
      setLetterer(comicInfo.letterer);
      setCoverArtist(comicInfo.coverArtist);
      setEditor(comicInfo.editor);
      setPublisher(comicInfo.publisher);
      setImprint(comicInfo.imprint);
      setGenre(comicInfo.genre);
      setPageCount(comicInfo.pageCount);
      setFormat(comicInfo.format);
      setCharacters(comicInfo.characters);
      setThumb(comicInfo.pages[0].source);
      setLocation(comicInfo.location)
      setPages(comicInfo.pages)
      console.log("Ran")
    } else {
      console.log("Didn't run")
    }
  }

  // Modal to confirm the addition of a new game to the library
  if (comicInfo) {
    return (
      <Modal onLoad={loader}
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="text-light"
      >
        <Modal.Header closeButton className="bg-dark">
          <Modal.Title id="contained-modal-title-vcenter">
            Add {comicInfo.series} #{comicInfo.number} to your catalogue
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
        <Form>
          <Row>
            <Form.Group className="md-3 col-3" controlId="formThumb">
              <Form.Label>Thumbnail</Form.Label>
              <Carousel interval={null} variant="dark">
              {
                  comicInfo.pages.map(function(i, index) {
                    if (index === 0) {
                      return (
                        <Carousel.Item key={index}>
                          <ImageFlipper images={comicInfo.pages} count={comicInfo.pageCount} number={i}/>
                          <Carousel.Caption as="form-check">
                            <label class="form-check-label" for="flexRadioDefault1">
                              Use
                            </label>
                            <input class="form-check-input" type="radio" name="flexRadioDefault" defaultChecked value={i.source} id="flexRadioDefault1" onChange={addThumb}/>
                          </Carousel.Caption>
                        </Carousel.Item>
                      )
                    } else {
                      return (
                        <Carousel.Item key={index}>
                          <ImageFlipper images={comicInfo.pages} count={comicInfo.pageCount} number={i}/>
                          <Carousel.Caption as="form-check">
                            <label class="form-check-label" for="flexRadioDefault1">
                              Use
                            </label>
                            <input class="form-check-input" type="radio" name="flexRadioDefault" value={i.source} id="flexRadioDefault1" onChange={addThumb}/>
                          </Carousel.Caption>
                        </Carousel.Item>
                      )
                    }
                  })
                  }
              </Carousel>
            </Form.Group>
            <Col>
              <Row>
                <Form.Group className="mb-3 col" controlId="formSeries">
                  <Form.Label>Series</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.series} onChange={addSeries} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formAlternateSeries">
                  <Form.Label>Storyline</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.alternateSeries} onChange={addAlternateSeries} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group className="mb-3 col" controlId="formVolume">
                  <Form.Label>Volume</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.volume} onChange={addVolume} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formIssueNo">
                  <Form.Label>Issue</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.number} onChange={addNumber} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formCount">
                  <Form.Label>Count (if limited series)</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.count} onChange={addCount} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group className="mb-3 col" controlId="formTitle">
                  <Form.Label>Stories ("/" separated)</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.title} onChange={addTitle} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formGenre">
                  <Form.Label>Genre</Form.Label>
                  <Form.Control type="text" defaultValue={comicInfo.genre} onChange={addGenre} />
                </Form.Group>
              </Row>
              <Row>
                <Form.Group className="mb-3 col" controlId="formYear">
                  <Form.Label>Year</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.year} onChange={addYear} />
                </Form.Group>
                <Form.Group className="mb-3 col" controlId="formMonth">
                  <Form.Label>Month</Form.Label>
                  <Form.Control type="number" defaultValue={comicInfo.month} onChange={addMonth} />
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
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.characters} onChange={addCharacters} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formSummary">
              <Form.Label>Summary</Form.Label>
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.summary} onChange={addSummary} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows="2" defaultValue={comicInfo.notes} onChange={addNotes} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formBasicWriter">
              <Form.Label>Writer*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.writer} onChange={addWriter} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formPenciller">
              <Form.Label>Penciller*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.penciller} onChange={addPenciller} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formEditor">
              <Form.Label>Editor*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.editor} onChange={addEditor} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formInker">
              <Form.Label>Inker*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.inker} onChange={addInker} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formColorist">
              <Form.Label>Colorist*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.colorist} onChange={addColorist} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formLetterer">
              <Form.Label>Letterer*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.letterer} onChange={addLetterer} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formCoverArtist">
              <Form.Label>Cover Artist*</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.coverArtist} onChange={addCoverArtist} />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3 col" controlId="formPublisher">
              <Form.Label>Publisher</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.publisher} onChange={addPublisher} />
            </Form.Group>
            <Form.Group className="mb-3 col" controlId="formImprint">
              <Form.Label>Imprint</Form.Label>
              <Form.Control type="text" defaultValue={comicInfo.imprint} onChange={addImprint} />
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