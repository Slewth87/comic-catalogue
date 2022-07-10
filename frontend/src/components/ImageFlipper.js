function ImageFlipper(props) {
    var file = "http://localhost:2814"+props.images[props.number.image].source
    return (
      <div className="d-block">
        <img id={"thumb"+props.number.image}
          className="d-block w-100"
          src={file}
          alt={"Page " + props.number }
        />
      </div>
    );
}

export default ImageFlipper;