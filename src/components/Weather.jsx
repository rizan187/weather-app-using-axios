import React, { useState } from 'react';
import axios from 'axios';

const Weather = () => {
    const [data, setData] = useState({});
    const [location, setLocation] = useState('');
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=78b80c7f76b0e73026216dfe61a5ccb9&units=metric`;
    const searchLocation = () => {
        axios.get(url)
            .then((response) => {setData(response.data)})
            setLocation('');
    };
    // Determine background class based on weather condition
    let weatherClass = 'default';
    if (data.weather && data.weather[0]) {
        const main = data.weather[0].main.toLowerCase();
        if (['clear', 'clouds', 'rain', 'snow', 'thunderstorm', 'mist', 'haze', 'drizzle'].includes(main)) {
            // treat drizzle as rain for bg
            weatherClass = main === 'drizzle' ? 'rain' : main;
        }
    }

  return (
   <div className={`app-wrap ${weatherClass}`}>
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
            data.main ? <h1>{Math.round(data.main.temp)}°C | {Math.round((data.main.temp * 9/5) + 32)}°F</h1>: null
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
                data.wind ? <p>{data.wind.speed} km/h</p> : null
            }
          </div>
          <div className="info-box">
            <h4>💧 Humidity</h4>
            {
                data.main && data.main.humidity ? <p>{data.main.humidity}%</p> : null
            }
          </div>
        </div>
      </div>
    </div>
   </div>
  )
}

export default Weather