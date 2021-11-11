import React, {useState, useEffect} from 'react';
import './App.css';
import TemperatureWarmIcon from './temperature-warm.jsx';
import HumidityIcon from './humidity.jsx';

function App() {
	const [currentTime, setCurrentTime] = useState(0);
    return (
    <div className="content">
        <header className="App-header">
            <span className="title">Chickenbot.ch</span>
            <div className="rooster-wrapper">
                <img src="rooster.png" className="rooster-image"></img>
            </div>
        </header>
        <div class="grid">
            <div class="rcorners rcorner-0 tile-wrapper">
                <div class="tile-row">
                    <TemperatureWarmIcon className="icon"/>
                    <span>16°C</span>
                </div>
                <div class="tile-row">
                    <HumidityIcon className="icon" fill="#2980B9"/>
                    <span>45%</span>
                </div>
            </div>
            <div class="rcorners tile-text-row">
                <span>Zuletzt geöffnet</span>
                <span>10.11.2021 08:43</span>
            </div>
            <div class="rcorners tile-keyword-row">OFFEN</div>
            <div className="rcorners rcorner-3">
                <div className="tile-title">Kamera</div>
                <img src="view.jpg" className="webcam"></img>
            </div>
            <div className="rcorners">
                <div className="tile-title">Steuerung</div>
            </div>
        </div>
    </div>
  );
}
export default App;
