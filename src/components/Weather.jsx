import React, { useState } from 'react';
import axios from 'axios';
const Weather = () => {
    const [data, setData] = useState({});
    const [location, setLocation] = useState('');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=78b80c7f76b0e73026216dfe61a5ccb9`;
    const searchLocation = () => {
        axios.get(url)
            .then((response) => {setData(response.data)})
            setLocation('');
    };
  return (
   <div className="container">
      <div className="weather-app">
        <h2>Weather App</h2>
        <div className="search-box">
            <input
            type='text'
            aria-label='text'
            placeholder= 'enter the city name'
            value={location}
            onChange ={ (e) => setLocation(e.target.value)}
            />
          <button onClick={searchLocation}>Search</button>
        </div>
        <div className="weather-info">
          {
            data.main ? <h1>{data.main.temp}F</h1>: null
          }
          {
            data.weather ? <p>{data.weather[0].main}</p> : null
          }
            
          <p>{
                data.name
            }</p>
        </div>
        <div className="extra-info">
          <div className="info-box">
            <h4>💨 Wind</h4>
            {
                data.wind ? <p>{data.wind.speed}Km/hrs</p> : null
            }
          </div>
          <div className="info-box">
            <h4>💧 Humidity</h4>
            {
                data.main.humidity ? <p>{data.main.humidity}%</p> : null
            }
          </div>
        </div>
      </div>
    </div>

  )
}

export default Weather