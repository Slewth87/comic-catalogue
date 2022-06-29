function ImageFlipper(props) {
    console.log(props)
    var file = "http://localhost:2814"+props.images[props.number.Image].Source
    return (
              <img
                className="d-block w-100"
                src={file}
                alt={"Page " + props.number }
              />
    );
}

export default ImageFlipper;