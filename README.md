# Skycast · Weather App

A React + Vite weather app with a glassmorphism UI, animated weather skies, and hand-drawn SVG icons.

## Features

- **Current conditions** — temperature, feels-like, high/low, condition, live local date & time for the searched city
- **Hourly forecast** — next 24 hours with temperature and chance of precipitation
- **5-day forecast** — daily high/low with temperature range bars
- **Details panel** — feels like, humidity, wind (speed + direction), pressure, visibility, cloud cover
- **Sun times** — sunrise, sunset and total daylight duration
- **Air quality** — AQI index with PM2.5, PM10, O₃ and NO₂ readings
- **°C / °F toggle** — persisted across visits, converts instantly
- **Geolocation** — one-tap "use my location"
- **Recent searches** — last 5 cities saved in localStorage; reopens your last city on launch
- **Dynamic backgrounds** — the whole page becomes the weather: sun glow, drifting clouds, rain, snow, stars at night, lightning flashes, fog banks (all CSS, respects `prefers-reduced-motion`)
- Loading skeletons and friendly error states

## Getting started

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
npm run preview
```

## Data source

Weather data comes from the free [OpenWeatherMap](https://openweathermap.org/api) API (current weather, 5-day/3-hour forecast and air pollution endpoints). The API key lives in `src/components/Weather.jsx` (`API_KEY`) — swap in your own if needed and keep it out of public repos.
