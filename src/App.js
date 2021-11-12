import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap-buttons';
import 'react-bootstrap-buttons/dist/react-bootstrap-buttons.css';
import {ReactSpinner} from 'react-spinning-wheel';
import 'react-spinning-wheel/dist/style.css';
import TimePicker from 'react-time-picker';
import './App.css';
import TemperatureWarmIcon from './temperature-warm.jsx';
import HumidityIcon from './humidity.jsx';
import {io} from 'socket.io-client';

const socket = io();


function App() {
	const [temp, setTemp] = useState(0);
    const [humi, setHumi] = useState(0);
    const [morningValue, onChangeMorningValue] = useState('10:00');
    const [eveningValue, onChangeEveningValue] = useState('19:00');

    const [doorState, setDoorState] = useState("opened");
    const [imgName, setImgName] = useState("../../chickenBot/data/images/watermarked_Nov-12-2021_22:35:56.jpg");

	useEffect(() => {
	    fetch('/data').then(res => res.json()).then(data => {
            setTemp(data.temp);
            setHumi(data.humi);
            onChangeMorningValue(data.morning);
            onChangeEveningValue(data.evening);
        });
    }, []);

    const triggerDoor=()=>{
        fetch("/triggerDoor")
    };

    useEffect(() => {
        socket.on('triggerDoorResponse', (resp) => {
            setDoorState("moving");
            console.log("triggerDoorResponse");
        });
    }, []);

    useEffect(() => {
        socket.on('finishedDoorResponse', (resp) => {
            setDoorState(resp.data);
            console.log("finishedDoorResponse");
        });
    }, []);

    useEffect(() => {
        socket.on('updateImage', (resp) => {
            alert(resp.data);
            console.log("updateImage");
        });
    }, []);



    return (
    <div className="content">
        <header className="App-header">
            <span className="title">Chickenbot.ch</span>
            <div className="rooster-wrapper">
                <img src="rooster.png" className="rooster-image" alt="rooster"></img>
            </div>
        </header>
        <div className="grid">
            <div className="rcorners rcorner-0 tile-wrapper">
                <div className="tile-row">
                    <TemperatureWarmIcon className="icon"/>
                    <span>{temp}°C</span>
                </div>
                <div className="tile-row">
                    <HumidityIcon className="icon" fill="#2980B9"/>
                    <span>{humi}%</span>
                </div>
            </div>
            <div className="rcorners tile-text-row">
                <span>Zuletzt geöffnet</span>
                <span>10.11.2021 08:23</span>
            </div>
            <div className="rcorners tile-keyword-row">
                <span>OFFEN</span>
            </div>
            <div className="rcorners rcorner-3">
                <div className="tile-title">Kamera</div>
                <img src={imgName} className="webcam" alt=""></img>
            </div>
            <div className="rcorners">
                <div className="tile-title">Steuerung</div>
                <div className="control-wrapper">

                    <span>Öffnung um</span>
                    <TimePicker
                        onChange={onChangeMorningValue}
                        value={morningValue}
                    />
                    <div></div>
                    <span>Schliessung um</span>
                    <TimePicker
                        onChange={onChangeEveningValue}
                        value={eveningValue}
                    />
                    <div></div>
                    <div></div>

                    {
                        doorState==="closed"&&(
                        <Button lg btnStyle="default" onClick={triggerDoor}>Öffnen</Button>
                        )
                    }
                    {
                        doorState==="opened"&&(
                            <Button lg btnStyle="default" onClick={triggerDoor}>Schliessen</Button>
                        )
                    }
                    {
                        (doorState==="moving")&&(
                            <div>
                                <ReactSpinner />
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    </div>
  );
}
export default App;
