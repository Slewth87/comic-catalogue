function Formatter(props) {
  console.log("Formatter:")
  console.log(props)
  var field = props;
  var delimiter = "";
  if (field === "Title") {
    delimiter = " / "
  } else {
    delimiter = ", "
  }
  var newStr = JSON.stringify({"jenny": "Gump"});
  return newStr;
}

export default Formatter;