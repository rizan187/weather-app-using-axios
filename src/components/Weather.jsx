import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import WeatherIcon, { Icon } from './WeatherIcon';
import './weather.css';

const API_KEY = '78b80c7f76b0e73026216dfe61a5ccb9';
const API_BASE = 'https://api.openweathermap.org/data/2.5';
const DEFAULT_CITY = 'New York';

const STORAGE = {
  unit: 'skycast:unit',
  recents: 'skycast:recents',
  last: 'skycast:lastCity',
};

const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const AQI_LEVELS = {
  1: ['Good', '#4ade80'],
  2: ['Fair', '#a3e635'],
  3: ['Moderate', '#facc15'],
  4: ['Poor', '#fb923c'],
  5: ['Very poor', '#f87171'],
};

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = (deg = 0) => COMPASS[Math.round(deg / 22.5) % 16];

/* Unit-aware formatters (API is always fetched in metric, conversion is local). */
const toF = (c) => c * 9 / 5 + 32;
const temp = (c, unit) => (c == null ? '–' : Math.round(unit === 'metric' ? c : toF(c)));
const unitSym = (unit) => (unit === 'metric' ? '°C' : '°F');
const speed = (ms, unit) => {
  if (ms == null) return '–';
  return unit === 'metric' ? `${Math.round(ms * 3.6)} km/h` : `${Math.round(ms * 2.23694)} mph`;
};
const dist = (m, unit) => {
  if (m == null) return '–';
  return unit === 'metric' ? `${(m / 1000).toFixed(1)} km` : `${(m / 1609.34).toFixed(1)} mi`;
};
const press = (hpa, unit) => {
  if (hpa == null) return '–';
  return unit === 'metric' ? `${hpa} hPa` : `${(hpa * 0.02953).toFixed(2)} inHg`;
};

/* Time helpers: shift by the city's UTC offset, then read as UTC. */
const at = (unixSec, offsetSec) => new Date((unixSec + offsetSec) * 1000);
const fmtTime = (unixSec, offsetSec) =>
  at(unixSec, offsetSec).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
const fmtHour = (unixSec, offsetSec) =>
  at(unixSec, offsetSec).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
const fmtDay = (unixSec, offsetSec) =>
  at(unixSec, offsetSec).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
const duration = (secs) => `${Math.floor(secs / 3600)}h ${Math.round((secs % 3600) / 60)}m`;

/* Condition -> background scene. */
const BG = {
  clear: 'clear',
  clouds: 'clouds',
  rain: 'rain',
  drizzle: 'rain',
  thunderstorm: 'thunderstorm',
  snow: 'snow',
  mist: 'fog',
  fog: 'fog',
  haze: 'fog',
  smoke: 'fog',
  dust: 'fog',
  sand: 'fog',
  ash: 'fog',
  squall: 'rain',
  tornado: 'fog',
};

const Skeleton = () => (
  <div className="grid" aria-hidden="true">
    <div className="card hero">
      <div className="skel skel-line" style={{ width: '55%' }} />
      <div className="skel skel-block" style={{ height: 110 }} />
      <div className="skel skel-line" style={{ width: '70%' }} />
    </div>
    <div className="side">
      <div className="card">
        <div className="skel skel-line" style={{ width: '30%' }} />
        <div className="skel skel-block" style={{ height: 150 }} />
      </div>
      <div className="card">
        <div className="skel skel-line" style={{ width: '40%' }} />
        <div className="skel skel-block" style={{ height: 70 }} />
      </div>
    </div>
    <div className="card span2">
      <div className="skel skel-strip" />
    </div>
  </div>
);

const EmptyState = ({ onLocate }) => (
  <main className="grid">
    <section className="card span2 empty">
      <WeatherIcon code="02d" size={90} />
      <h3>No weather yet</h3>
      <p>Search for any city above, or let the browser find you.</p>
      <button type="button" className="btn btn-primary" onClick={onLocate}>
        <Icon name="pin" size={16} />
        Use my location
      </button>
    </section>
  </main>
);

const Weather = () => {
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState(() => readLS(STORAGE.unit, 'metric'));
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [air, setAir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recents, setRecents] = useState(() => readLS(STORAGE.recents, []));
  const [tick, setTick] = useState(Date.now());
  const booted = useRef(false);

  /* Live local clock for the searched city (updates every 30s). */
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const loadData = useCallback(async (target) => {
    setLoading(true);
    setError('');
    try {
      const params = target.q ? { q: target.q } : { lat: target.lat, lon: target.lon };
      const [wRes, fRes] = await Promise.all([
        axios.get(`${API_BASE}/weather`, { params: { ...params, units: 'metric', appid: API_KEY }, timeout: 12000 }),
        axios.get(`${API_BASE}/forecast`, { params: { ...params, units: 'metric', appid: API_KEY }, timeout: 12000 }),
      ]);
      const w = wRes.data;
      setWeather(w);
      setForecast(fRes.data);
      setAir(null);
      setQuery('');
      localStorage.setItem(STORAGE.last, JSON.stringify(w.name));
      setRecents((prev) => {
        const next = [w.name, ...prev.filter((c) => c.toLowerCase() !== w.name.toLowerCase())].slice(0, 5);
        localStorage.setItem(STORAGE.recents, JSON.stringify(next));
        return next;
      });
      /* Air quality is a separate endpoint — treat it as optional. */
      try {
        const aRes = await axios.get(`${API_BASE}/air_pollution`, {
          params: { lat: w.coord.lat, lon: w.coord.lon, appid: API_KEY },
          timeout: 12000,
        });
        setAir(aRes.data);
      } catch {
        /* not critical */
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setError(`Couldn't find "${target.q || 'that place'}". Check the spelling and try again.`);
      } else if (err?.response?.status === 401) {
        setError('The weather service rejected the API key. Please try again later.');
      } else {
        setError('Something went wrong while fetching the weather. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* Boot: reopen the last searched city. */
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    loadData({ q: readLS(STORAGE.last, DEFAULT_CITY) });
  }, [loadData]);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    loadData({ q });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => loadData({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        setError('Location access was denied. Search for a city instead.');
        setLoading(false);
      },
      { timeout: 10000 },
    );
  };

  const setUnitPref = (u) => {
    setUnit(u);
    localStorage.setItem(STORAGE.unit, JSON.stringify(u));
  };

  /* ---- derived view data ---- */
  const w = weather;
  const tz = w?.timezone ?? 0;
  const isNight = !!w?.weather?.[0]?.icon?.endsWith('n');
  const bg = w ? BG[w.weather?.[0]?.main?.toLowerCase()] || 'default' : 'default';
  const busy = loading && !!w;

  const localDate = w
    ? at(tick / 1000, tz).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';
  const localTime = w
    ? at(tick / 1000, tz).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' })
    : '';

  /* Next 24 hours (3h steps). */
  const hours = (forecast?.list ?? []).slice(0, 8).map((h, i) => ({
    key: h.dt,
    label: i === 0 ? 'Now' : fmtHour(h.dt, tz),
    code: h.weather?.[0]?.icon,
    t: temp(h.main?.temp, unit),
    pop: Math.round((h.pop ?? 0) * 100),
  }));

  /* Group the 3-hourly list into calendar days. */
  const buckets = {};
  (forecast?.list ?? []).forEach((item) => {
    const key = at(item.dt, tz).toISOString().slice(0, 10);
    (buckets[key] ??= []).push(item);
  });
  const days = Object.values(buckets).slice(0, 6).map((entries, i) => {
    let pick = entries[0];
    let best = Infinity;
    entries.forEach((e) => {
      const diff = Math.abs(at(e.dt, tz).getUTCHours() - 12);
      if (diff < best) {
        best = diff;
        pick = e;
      }
    });
    const temps = entries.map((e) => e.main?.temp).filter((t) => t != null);
    return {
      label: i === 0 ? 'Today' : fmtDay(entries[0].dt, tz),
      code: pick.weather?.[0]?.icon,
      pop: Math.round(Math.max(...entries.map((e) => e.pop ?? 0)) * 100),
      lo: temps.length ? Math.min(...temps) : null,
      hi: temps.length ? Math.max(...temps) : null,
    };
  });
  const loAll = Math.min(...days.map((d) => d.lo ?? Infinity));
  const hiAll = Math.max(...days.map((d) => d.hi ?? -Infinity));
  const range = hiAll - loAll || 1;

  const aqiEntry = air?.list?.[0];
  const aqi = aqiEntry?.main?.aqi;
  const aqiInfo = AQI_LEVELS[aqi];

  const sunrise = w?.sys?.sunrise;
  const sunset = w?.sys?.sunset;
  const dayLen = sunrise && sunset ? duration(sunset - sunrise) : null;

  const todayHi = days[0]?.hi ?? w?.main?.temp_max;
  const todayLo = days[0]?.lo ?? w?.main?.temp_min;

  const stats = [
    { icon: 'thermo', label: 'Feels like', value: `${temp(w?.main?.feels_like, unit)}°` },
    { icon: 'droplet', label: 'Humidity', value: w?.main?.humidity != null ? `${w.main.humidity}%` : '–' },
    {
      icon: 'wind',
      label: 'Wind',
      value: speed(w?.wind?.speed, unit),
      sub: w?.wind?.deg != null ? compass(w.wind.deg) : null,
    },
    { icon: 'gauge', label: 'Pressure', value: press(w?.main?.pressure, unit) },
    { icon: 'eye', label: 'Visibility', value: dist(w?.visibility, unit) },
    { icon: 'cloud', label: 'Cloud cover', value: w?.clouds?.all != null ? `${w.clouds.all}%` : '–' },
  ];

  return (
    <div className={`app-wrap bg-${bg}${isNight ? ' night' : ''}`}>
      <div className={`fx fx-${bg}${isNight ? ' fx-night' : ''}`} aria-hidden="true" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-badge">
              <Icon name="sun" size={20} />
            </span>
            Skycast
          </div>
          <div className="controls">
            <div className="units" role="group" aria-label="Temperature units">
              <button
                type="button"
                className={unit === 'metric' ? 'active' : ''}
                onClick={() => setUnitPref('metric')}
                aria-pressed={unit === 'metric'}
              >
                °C
              </button>
              <button
                type="button"
                className={unit === 'imperial' ? 'active' : ''}
                onClick={() => setUnitPref('imperial')}
                aria-pressed={unit === 'imperial'}
              >
                °F
              </button>
            </div>
            <button
              type="button"
              className="btn icon-btn"
              onClick={useMyLocation}
              disabled={loading}
              title="Use my location"
              aria-label="Use my location"
            >
              <Icon name="pin" size={17} />
            </button>
          </div>
        </header>

        <form className="search" onSubmit={submit}>
          <div className="search-field">
            <Icon name="search" size={17} />
            <input
              type="text"
              value={query}
              placeholder="Search any city… e.g. Tokyo"
              onChange={(e) => setQuery(e.target.value)}
              aria-label="City name"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" aria-hidden="true" /> : 'Search'}
          </button>
        </form>

        {recents.length > 0 && (
          <div className="chips">
            {recents.map((c) => (
              <button type="button" key={c} className="chip-btn" onClick={() => !loading && loadData({ q: c })}>
                {c}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="error" role="alert">
            <Icon name="alert" size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading && !w ? (
          <Skeleton />
        ) : w ? (
          <main className={`grid${busy ? ' busy' : ''}`} aria-busy={busy} key={w.id ?? w.name}>
            <section className="card hero">
              <div className="hero-top">
                <div>
                  <div className="hero-city">
                    <Icon name="pin" size={17} />
                    {w.name}
                    {w.sys?.country ? `, ${w.sys.country}` : ''}
                  </div>
                  <div className="hero-sub">
                    <Icon name="clock" size={13} /> {localDate} · {localTime}
                  </div>
                </div>
                <span className="cond-chip">{w.weather?.[0]?.description || '—'}</span>
              </div>
              <div className="hero-main">
                <div className="hero-temp">
                  {temp(w.main?.temp, unit)}
                  <span className="deg">{unitSym(unit)}</span>
                </div>
                <WeatherIcon code={w.weather?.[0]?.icon} size={124} />
              </div>
              <div className="hero-meta">
                <span>
                  Feels like <b>{temp(w.main?.feels_like, unit)}°</b>
                </span>
                <span className="sep" />
                <span>
                  H <b>{temp(todayHi, unit)}°</b>
                </span>
                <span className="sep" />
                <span>
                  L <b>{temp(todayLo, unit)}°</b>
                </span>
              </div>
            </section>

            <div className="side">
              <section className="card">
                <h3 className="card-title">Details</h3>
                <div className="stats">
                  {stats.map((s) => (
                    <div className="stat" key={s.label}>
                      <span className="stat-label">
                        <Icon name={s.icon} size={15} />
                        {s.label}
                      </span>
                      <b>{s.value}</b>
                      {s.sub ? <small>{s.sub}</small> : null}
                    </div>
                  ))}
                </div>
              </section>

              <section className="card">
                <h3 className="card-title">Sun</h3>
                <div className="sun-grid">
                  <div className="sun-cell">
                    <Icon name="sunrise" size={19} />
                    <b>{sunrise ? fmtTime(sunrise, tz) : '–'}</b>
                    <span>Sunrise</span>
                  </div>
                  <div className="sun-cell">
                    <Icon name="sunset" size={19} />
                    <b>{sunset ? fmtTime(sunset, tz) : '–'}</b>
                    <span>Sunset</span>
                  </div>
                  <div className="sun-cell">
                    <Icon name="clock" size={19} />
                    <b>{dayLen ?? '–'}</b>
                    <span>Daylight</span>
                  </div>
                </div>
              </section>

              <section className="card">
                <h3 className="card-title">Air quality</h3>
                {aqi && aqiInfo ? (
                  <>
                    <div className="aqi-top">
                      <span className="aqi-dot" style={{ background: aqiInfo[1], color: aqiInfo[1] }} />
                      <b className="aqi-label">{aqiInfo[0]}</b>
                      <span className="aqi-scale">Index {aqi} of 5</span>
                    </div>
                    <div className="pollutants">
                      <span className="pill">
                        PM2.5 <b>{Math.round(aqiEntry.components?.pm2_5 ?? 0)}</b>
                      </span>
                      <span className="pill">
                        PM10 <b>{Math.round(aqiEntry.components?.pm10 ?? 0)}</b>
                      </span>
                      <span className="pill">
                        O₃ <b>{Math.round(aqiEntry.components?.o3 ?? 0)}</b>
                      </span>
                      <span className="pill">
                        NO₂ <b>{Math.round(aqiEntry.components?.no2 ?? 0)}</b>
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="empty-note">Air quality data isn&apos;t available for this location.</p>
                )}
              </section>
            </div>

            <section className="card span2">
              <h3 className="card-title">Next 24 hours</h3>
              <div className="hours">
                {hours.map((h) => (
                  <div className={`hour${h.label === 'Now' ? ' hour-now' : ''}`} key={h.key}>
                    <span className="hour-time">{h.label}</span>
                    <WeatherIcon code={h.code} size={34} />
                    <b className="hour-temp">{h.t}°</b>
                    <span className={`hour-pop${h.pop >= 5 ? '' : ' hide'}`}>
                      <Icon name="droplet" size={11} />
                      {h.pop}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card span2">
              <h3 className="card-title">5-day forecast</h3>
              <div className="days">
                {days.map((d) => {
                  const left = d.lo != null ? ((d.lo - loAll) / range) * 100 : 0;
                  const width = d.lo != null ? Math.max(((d.hi - d.lo) / range) * 100, 6) : 0;
                  return (
                    <div className="day" key={d.label}>
                      <span className="day-name">{d.label}</span>
                      <span className="day-ic">
                        <WeatherIcon code={d.code} size={28} />
                        <span className={`day-pop${d.pop >= 20 ? '' : ' hide'}`}>
                          <Icon name="droplet" size={10} />
                          {d.pop}%
                        </span>
                      </span>
                      <span className="day-lo">{temp(d.lo, unit)}°</span>
                      <span className="track">
                        <span className="fill" style={{ left: `${left}%`, width: `${width}%` }} />
                      </span>
                      <span className="day-hi">{temp(d.hi, unit)}°</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        ) : (
          <EmptyState onLocate={useMyLocation} />
        )}

        <footer className="foot">
          <Icon name="cloud" size={13} /> Live conditions · Powered by OpenWeatherMap
        </footer>
      </div>
    </div>
  );
};

export default Weather;
