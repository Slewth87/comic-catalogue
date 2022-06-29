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
  // for (let i=0;i<field.length - 1;i++) {
  //   field[i] = field[i] + delimiter
  //   console.log(i + ": " + field[i])
  // }
  var newStr = JSON.stringify({"jenny": "Gump"});
  return newStr;
}

export default Formatter;