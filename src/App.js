import "./App.css";
import ChickenBot from './ChickenBot.js';
import ProtectedRoute from './ProtectedRoute.js'
import { useState } from "react";
import { BrowserRouter as Router, Link, Route, Switch, Redirect } from "react-router-dom";
import { Button, ButtonGroup } from 'react-bootstrap-buttons';
import 'react-bootstrap-buttons/dist/react-bootstrap-buttons.css';



function App(){
    const [isAuth, setIsAuth] = useState(false)
    const [input, setInput] = useState('')


    const login=()=>{
        fetch('/api/authenticate?' + new URLSearchParams({
            password: input,
        })).then(res => res.json()).then(data => {
            var res = (data.auth === 'true');
            setIsAuth(res);
            if (res === false){
                alert(data.auth);
            }
        });
    };

    return (
        <Router>
            {
                isAuth===true&&(
                    <Redirect to='/home'/>
                )
            }
            <Route path="/" exact>
            <div className="content">
            <header className="App-header">
                <span className="title">Chickenbot.ch</span>
                <div className="rooster-wrapper">
                    <img src="rooster.png" className="rooster-image" alt="rooster"></img>
                </div>
            </header>



            <div className="rcorners login">
                <div className="tile-title">Login</div>
                <div className="login-text-row">
                    <p>Für die die Benutzung des ChickenBots ist eine Anmeldung erforderlich.</p>
                </div>
                <div className="login-text-row">
                    <input onChange={event => setInput(event.target.value)} style={{ width:"300px", height: "30px", fontSize: 18 }} type="password" placeholder="Password" />
                </div>
                <div className="tile-text-row">
                    <div className="tile-text-row">

                    <Button lg btnStyle="primary" onClick={login}>Anmelden</Button>
                    </div>
                </div>

            </div>

            <div className="tile-text-row">
                <footer className="footer">
                    ©2022, chickenbot.ch, Zuoz
                </footer>
            </div>



        </div>
            </Route>
                <ProtectedRoute path="/home" component={ChickenBot} isAuth={isAuth}/>
        </Router>

    );
}

export default App;

