import React, {useState, useEffect} from 'react';
import {Line} from 'react-chartjs-2';
import { Button, ButtonGroup } from 'react-bootstrap-buttons';
import 'react-bootstrap-buttons/dist/react-bootstrap-buttons.css';
import {ReactSpinner} from 'react-spinning-wheel';
import 'react-spinning-wheel/dist/style.css';
import TimePicker from 'react-time-picker';
import './App.css';
import TemperatureWarmIcon from './temperature-warm.jsx';
import HumidityIcon from './humidity.jsx';
import XIcon from './x.jsx';
import {io} from 'socket.io-client';

const socket = io();



function App() {
	const [temp, setTemp] = useState(0);
    const [humi, setHumi] = useState(0);
    const [morningValue, onChangeMorningValue] = useState('10:00');
    const [eveningValue, onChangeEveningValue] = useState('19:00');

    const [doorState, setDoorState] = useState("opened");
    const [doorHistoryInfo, setHistoryDoorInfo] = useState("opened");
    const [doorDate, setDoorDate] = useState("00/00/2020 00:00");
    const [imgName, setImgName] = useState("view.jpg");

    const [tempData, setTempData] = useState([0]);
    const [humiData, setHumiData] = useState([0]);
    const [labelsFromBackend, setLabelsFromBackend] = useState([0]);

    const [displayChart, setDisplayChart] = useState(false);


    const data = {
        labels: labelsFromBackend,
        datasets: [
            {
                label: "Temperatur",
                data: tempData,
                fill: false,
                borderColor: "#2980B9",
                lineTension:0.5,
                yAxisID: 'y',
                pointHitRadius: 20,
            },
            {
                label: "Feuchtigkeit",
                data: humiData,
                fill: true,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                lineTension:0.5,
                yAxisID: 'y1',
                pointHitRadius: 20,
            },

        ],
    };

    const config = {
        options: {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperatur'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return value + 'C°';
                        }
                    },
                    type: 'linear',
                    display: true,
                    position: 'left',
                    unit: "C°"

                },
                y1: {
                    title: {
                        display: true,
                        text: 'Feuchtigkeit'
                    },
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return value + '%';
                        },

                    },
                    display: true,
                    position: 'right',
                },
            }
        },
    };



	useEffect(() => {
	    fetch('/api/data').then(res => res.json()).then(data => {
            setTemp(data.temp);
            setHumi(data.humi);
            onChangeMorningValue(data.morning);
            onChangeEveningValue(data.evening);
            setHistoryDoorInfo(data.status);
            setDoorDate(data.date);
            setDoorState(data.status);
            setImgName(data.imageName);
        });
        fetch('/api/getDayData').then(res => res.json()).then(data => {
            setTempData(data.temp);
            setHumiData(data.humi);
            setLabelsFromBackend(data.labels);
        });

    }, []);

    const getWeekData=()=>{
        fetch('/api/getWeekData').then(res => res.json()).then(data => {
            setTempData(data.temp);
            setHumiData(data.humi);
            setLabelsFromBackend(data.labels);
        });
    };

    const getDayData=()=>{
        fetch('/api/getDayData').then(res => res.json()).then(data => {
            setTempData(data.temp);
            setHumiData(data.humi);
            setLabelsFromBackend(data.labels);
        });
    };

    const triggerDoor=()=>{
        fetch("/api/triggerDoor")
    };

    const triggerDisplayData=()=>{
        setDisplayChart(!displayChart);
    };

    const dateChange=()=>{
        socket.emit("dateChange", {"eveningValue": eveningValue, "morningValue": morningValue});
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
            console.log("updateImage");
            setImgName(resp.data);
        });
    }, []);

    useEffect(() => {
        socket.on('updateDoorHistory', (resp) => {
            setHistoryDoorInfo(resp.status);
            setDoorDate(resp.date);
            console.log("updateDoorHistory");
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
            <div className="rcorners rcorner-0 tile-wrapper" onClick={() => triggerDisplayData()}>
                <div className="tile-row">
                    <TemperatureWarmIcon className="icon"/>
                    <span>{temp}°C</span>
                </div>
                <div className="tile-row">
                    <HumidityIcon className="icon" fill="#2980B9"/>
                    <span>{humi}%</span>
                </div>
            </div>

                {
                    doorHistoryInfo==="opened"&&(
                        <div className="rcorners tile-text-row">
                            <span>Zuletzt geöffnet</span>
                            <span>{doorDate}</span>
                        </div>
                    )
                }
                {
                    doorHistoryInfo==="closed"&&(
                        <div className="rcorners tile-text-row">
                            <span>Zuletzt geschlossen</span>
                            <span>{doorDate}</span>
                        </div>
                    )
                }

            {

                doorState==="closed"&&(
                    <div className="rcorners tile-keyword-row-red">
                        <span>GESCHLOSSEN</span>
                    </div>
                )
            }
            {
                doorState==="opened"&&(
                    <div className="rcorners tile-keyword-row-green">
                        <span>OFFEN</span>
                    </div>
                )
            }
            {
                doorState==="moving"&&(
                    <div className="rcorners tile-keyword-row-orange">
                        <span>IN BEWEGUNG</span>
                    </div>
                )
            }
            {
                displayChart===true&&(
                    <div className="rcorners rcorner-chart">
                        <div className="tile-title">Diagramm<Button xs btnStyle="default" className="x-button-container" onClick={triggerDisplayData}><XIcon className="x-button"/></Button></div>
                        <div className="button-container ">
                            <ButtonGroup>
                                <Button btnStyle="default" onClick={getDayData}>Tag</Button>
                                <Button btnStyle="default" onClick={getWeekData}>Woche</Button>

                            </ButtonGroup>
                        </div>
                        <Line className='webcam' data={data} options={config.options}/>
                    </div>
                )
            }

            <div className="rcorners rcorner-3">
                <div className="tile-title">Kamera</div>
                <img src={imgName} className="webcam" alt="" ></img>
            </div>
            <div className="rcorners">
                <div className="tile-title">Steuerung</div>
                <div className="control-wrapper">

                    <span>Öffnung um</span>
                    <TimePicker
                        onChange={onChangeMorningValue}
                        value={morningValue}
                        onClockClose={dateChange}
                    />
                    <div></div>
                    <span>Schliessung um</span>
                    <TimePicker
                        onChange={onChangeEveningValue}
                        value={eveningValue}
                        onClockClose={dateChange}
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

            <footer className="footer">
                ©2022, chickenbot.ch, Zuoz
            </footer>
        </div>

    </div>
  );
}
export default App;
