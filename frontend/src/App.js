import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes as Switch, Route } from 'react-router-dom';
import MyNavbar from './components/MyNavbar';
import Upload from './views/Upload';
import Login from './views/Login';
import Logout from './views/Logout';
import Register from './views/Register';
import Catalogue from './views/Catalogue';
import ComicView from './views/ComicView';

function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  // Checks and records the current logged in state.
  useEffect(() => {
    async function fetchData() {
    const token = localStorage.getItem("token")

    if (token) {
      var data = await axios.get("http://34.244.147.208:2814/users/user", {params: {token: token}})
      if (data.status === 200) {
        setLoggedIn(true)
      } else {
        setLoggedIn(false)
      }
    } else {
      setLoggedIn(false)
    }
  }
  fetchData();
}, []);

  return (
    <div>
      <Router>
      <MyNavbar  loggedIn={loggedIn} />
        <div>
          <Switch>
            <Route exact path="/" element={<Catalogue loggedIn={loggedIn}/>} />
            <Route path="/login" element={<Login loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="/logout" element={<Logout loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="/register" element={<Register loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
            <Route path="/upload" element={<Upload loggedIn={loggedIn} />} />
            <Route path="/comic/:id" element={<ComicView loggedIn={loggedIn}/>} />
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
