// Hand-drawn SVG weather icons + a small stroke glyph set (no icon fonts needed).

const CLOUD_SHAPE = (
  <>
    <circle cx="24" cy="36" r="11" />
    <circle cx="38" cy="30" r="14" />
    <circle cx="47" cy="39" r="9" />
    <rect x="15" y="36" width="36" height="12" rx="6" />
  </>
);

const CLOUD_GRAD = (
  <defs>
    <linearGradient id="wiCloudA" gradientUnits="userSpaceOnUse" x1="32" y1="14" x2="32" y2="50">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="1" stopColor="#c6d4e8" />
    </linearGradient>
  </defs>
);

const BACK_CLOUD_GRAD = (
  <defs>
    <linearGradient id="wiCloudB" gradientUnits="userSpaceOnUse" x1="32" y1="6" x2="32" y2="42">
      <stop offset="0" stopColor="#a9bcd6" />
      <stop offset="1" stopColor="#8299b8" />
    </linearGradient>
  </defs>
);

const MOON_GRAD = (
  <defs>
    <linearGradient id="wiMoonG" gradientUnits="userSpaceOnUse" x1="30" y1="8" x2="54" y2="56">
      <stop offset="0" stopColor="#f7f9ff" />
      <stop offset="1" stopColor="#aebdf0" />
    </linearGradient>
  </defs>
);

const Frame = ({ size, className, children }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} fill="none" className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const Sun = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-01d">
    <defs>
      <radialGradient id="wiSunCore" gradientUnits="userSpaceOnUse" cx="32" cy="32" r="15">
        <stop offset="0" stopColor="#fff6c9" />
        <stop offset=".55" stopColor="#ffd94d" />
        <stop offset="1" stopColor="#ff9d2e" />
      </radialGradient>
    </defs>
    <g className="wi-sun-rays" stroke="#ffd166" strokeWidth="3.4" strokeLinecap="round">
      <line x1="32" y1="4" x2="32" y2="11" />
      <line x1="32" y1="53" x2="32" y2="60" />
      <line x1="4" y1="32" x2="11" y2="32" />
      <line x1="53" y1="32" x2="60" y2="32" />
      <line x1="12.2" y1="12.2" x2="17.2" y2="17.2" />
      <line x1="46.8" y1="46.8" x2="51.8" y2="51.8" />
      <line x1="12.2" y1="51.8" x2="17.2" y2="46.8" />
      <line x1="46.8" y1="17.2" x2="51.8" y2="12.2" />
    </g>
    <circle cx="32" cy="32" r="14" fill="url(#wiSunCore)" />
  </Frame>
);

const Moon = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-moon">
    {MOON_GRAD}
    <path d="M32 8a16 16 0 0 0 24 24 24 24 0 1 0-24-24Z" fill="url(#wiMoonG)" />
    <circle cx="13" cy="17" r="1.7" fill="#cdd7ff" opacity=".85" />
    <circle cx="8" cy="28" r="1.1" fill="#cdd7ff" opacity=".6" />
    <circle cx="17" cy="9" r="1.1" fill="#cdd7ff" opacity=".6" />
    <circle cx="11" cy="46" r="1.4" fill="#cdd7ff" opacity=".5" />
  </Frame>
);

const PartlyDay = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-02d">
    {CLOUD_GRAD}
    <defs>
      <radialGradient id="wiSunSmall" gradientUnits="userSpaceOnUse" cx="21" cy="19" r="10">
        <stop offset="0" stopColor="#fff6c9" />
        <stop offset="1" stopColor="#ffb02e" />
      </radialGradient>
    </defs>
    <g stroke="#ffd166" strokeWidth="3" strokeLinecap="round">
      <line x1="21" y1="2" x2="21" y2="6.5" />
      <line x1="21" y1="31.5" x2="21" y2="36" />
      <line x1="4" y1="19" x2="8.5" y2="19" />
      <line x1="33.5" y1="19" x2="38" y2="19" />
      <line x1="9" y1="7" x2="12.2" y2="10.2" />
      <line x1="29.8" y1="27.8" x2="33" y2="31" />
      <line x1="9" y1="31" x2="12.2" y2="27.8" />
      <line x1="29.8" y1="10.2" x2="33" y2="7" />
    </g>
    <circle cx="21" cy="19" r="9.5" fill="url(#wiSunSmall)" />
    <g fill="url(#wiCloudA)" transform="translate(4 14)">{CLOUD_SHAPE}</g>
  </Frame>
);

const PartlyNight = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-02n">
    {CLOUD_GRAD}
    {MOON_GRAD}
    <g transform="translate(2 0) scale(.58)" fill="url(#wiMoonG)">
      <path d="M32 8a16 16 0 0 0 24 24 24 24 0 1 0-24-24Z" />
    </g>
    <circle cx="12" cy="10" r="1.3" fill="#cdd7ff" opacity=".8" />
    <circle cx="7" cy="22" r="1" fill="#cdd7ff" opacity=".55" />
    <g fill="url(#wiCloudA)" transform="translate(4 15)">{CLOUD_SHAPE}</g>
  </Frame>
);

const Cloud = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-03">
    {CLOUD_GRAD}
    <g fill="url(#wiCloudA)" transform="translate(2 2)">{CLOUD_SHAPE}</g>
  </Frame>
);

const Overcast = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-04">
    {BACK_CLOUD_GRAD}
    {CLOUD_GRAD}
    <g fill="url(#wiCloudB)" transform="translate(-2 -8) scale(.92)">{CLOUD_SHAPE}</g>
    <g fill="url(#wiCloudA)" transform="translate(5 10)">{CLOUD_SHAPE}</g>
  </Frame>
);

const Drizzle = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-09">
    {CLOUD_GRAD}
    <g fill="url(#wiCloudA)" transform="translate(1 -1)">{CLOUD_SHAPE}</g>
    <g className="drops" stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round">
      <line x1="20" y1="51" x2="20" y2="55.5" />
      <line x1="30" y1="53" x2="30" y2="57.5" />
      <line x1="40" y1="51" x2="40" y2="55.5" />
      <line x1="47" y1="55" x2="47" y2="59" />
    </g>
  </Frame>
);

const Rain = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-10">
    {CLOUD_GRAD}
    <g fill="url(#wiCloudA)" transform="translate(1 -1)">{CLOUD_SHAPE}</g>
    <g className="drops" stroke="#4fb3f6" strokeWidth="3.4" strokeLinecap="round">
      <line x1="23" y1="50" x2="19.5" y2="57" />
      <line x1="33" y1="50" x2="29.5" y2="57" />
      <line x1="43" y1="50" x2="39.5" y2="57" />
    </g>
  </Frame>
);

const Storm = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-11">
    {CLOUD_GRAD}
    <defs>
      <linearGradient id="wiBoltG" gradientUnits="userSpaceOnUse" x1="34" y1="44" x2="34" y2="63">
        <stop offset="0" stopColor="#ffe36e" />
        <stop offset="1" stopColor="#ff9f1a" />
      </linearGradient>
    </defs>
    <g fill="url(#wiCloudA)" transform="translate(1 -3)">{CLOUD_SHAPE}</g>
    <path className="bolt" d="M34 44 28 55.5h5.2l-2.8 8L41 50h-5.4L39 44Z" fill="url(#wiBoltG)" />
  </Frame>
);

const Snow = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-13">
    {CLOUD_GRAD}
    <g fill="url(#wiCloudA)" transform="translate(1 -1)">{CLOUD_SHAPE}</g>
    <g className="flakes" fill="#f0f8ff">
      <circle cx="20" cy="52" r="2" />
      <circle cx="28" cy="55.5" r="2" />
      <circle cx="36" cy="52" r="2" />
      <circle cx="44" cy="55.5" r="2" />
      <circle cx="24" cy="59.5" r="2" />
      <circle cx="40" cy="59.5" r="2" />
    </g>
  </Frame>
);

const Fog = ({ size = 64 }) => (
  <Frame size={size} className="wi wi-50">
    {CLOUD_GRAD}
    <g fill="url(#wiCloudA)" transform="translate(1 -4) scale(.95)">{CLOUD_SHAPE}</g>
    <g className="foglines" stroke="rgba(255,255,255,.8)" strokeWidth="3.5" strokeLinecap="round">
      <line x1="12" y1="47" x2="52" y2="47" />
      <line x1="17" y1="54" x2="45" y2="54" />
      <line x1="10" y1="60" x2="40" y2="60" />
    </g>
  </Frame>
);

const CONDITION_ICONS = {
  '01d': Sun,
  '01n': Moon,
  '02d': PartlyDay,
  '02n': PartlyNight,
  '03': Cloud,
  '04': Overcast,
  '09': Drizzle,
  '10': Rain,
  '11': Storm,
  '13': Snow,
  '50': Fog,
};

/** Maps an OpenWeatherMap icon code (e.g. "10d") to a matching SVG icon. */
const WeatherIcon = ({ code, size = 64 }) => {
  const c = code || '01d';
  const base = c.replace(/[dn]$/, '');
  const Cmp = CONDITION_ICONS[c] || CONDITION_ICONS[base] || Cloud;
  return <Cmp size={size} />;
};

/* Small stroke glyphs used across the UI (24x24, stroke = currentColor). */
const GLYPHS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M5.2 18.8l1.7-1.7M17.1 6.9l1.7-1.7" />
    </>
  ),
  droplet: <path d="M12 3.4c3.3 4 5.7 6.9 5.7 9.9a5.7 5.7 0 1 1-11.4 0c0-3 2.4-5.9 5.7-9.9Z" />,
  wind: (
    <>
      <path d="M3.5 8h9.3a2.5 2.5 0 1 0-2.4-3.2" />
      <path d="M3.5 12.5h13.6a2.9 2.9 0 1 1-2.8 3.7" />
      <path d="M3.5 17h6" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12.5" r="8" />
      <path d="m12 12.5 3.6-3.4" />
      <path d="M12 20.5v-1.7M4.7 9.5l1.5.8M19.3 9.5l-1.5.8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.8 12S6.2 5.9 12 5.9 21.2 12 21.2 12 17.8 18.1 12 18.1 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="2.7" />
    </>
  ),
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  thermo: (
    <>
      <path d="M10.3 13.7V5.5a1.7 1.7 0 0 1 3.4 0v8.2a3.9 3.9 0 1 1-3.4 0Z" />
      <path d="M12 9.7v5.4" />
    </>
  ),
  sunrise: (
    <>
      <path d="M4 18.5h16" />
      <path d="M7.2 18.5a4.8 4.8 0 0 1 9.6 0" />
      <path d="M12 4.5v4" />
      <path d="m10 6.6 2-2.1 2 2.1" />
    </>
  ),
  sunset: (
    <>
      <path d="M4 18.5h16" />
      <path d="M7.2 18.5a4.8 4.8 0 0 1 9.6 0" />
      <path d="M12 4.5v4" />
      <path d="m10 6.4 2 2.1 2-2.1" />
    </>
  ),
  waves: <path d="M3 12.5h3.6l2.3-6 3.8 11 2.5-5h4.8" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21c-4.2-3.8-6.5-7-6.5-10.1a6.5 6.5 0 1 1 13 0C18.5 14 16.2 17.2 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.8V12l3 1.9" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.6 2.8 19.4h18.4L12 3.6Z" />
      <path d="M12 9.5v4.6" />
      <path d="M12 16.9v.2" />
    </>
  ),
};

export const Icon = ({ name, size = 18 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {GLYPHS[name] || GLYPHS.sun}
  </svg>
);

export default WeatherIcon;
