// @clj-animate quantumWave

function WeatherDashboard() {
  const [city, setCity] = __CLJ_useState('London');
  const [weather, setWeather] = __CLJ_useState(null);
  const [forecast, setForecast] = __CLJ_useState([]);
  const [loading, setLoading] = __CLJ_useState(false);
  const [unit, setUnit] = __CLJ_useState('metric');

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`);
      const geoData = await geoRes.json();
      if (!geoData.results) throw new Error('City not found');
      
      const { latitude, longitude } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`);
      const data = await weatherRes.json();
      
      setWeather({
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        condition: data.current.weather_code
      });
      
      setForecast(data.daily.time.map((time, i) => ({
        day: new Date(time).toLocaleDateString('en', { weekday: 'short' }),
        high: data.daily.temperature_2m_max[i],
        low: data.daily.temperature_2m_min[i],
        condition: data.daily.weather_code[i]
      })));
      
      if (typeof CLJ !== 'undefined') CLJ.Toast.show(`🌤️ Weather updated for ${city}`, 2000);
    } catch(e) {
      if (typeof CLJ !== 'undefined') CLJ.Toast.show(`❌ ${e.message}`, 3000);
    }
    setLoading(false);
  };

  __CLJ_useEffect(() => { fetchWeather(); }, []);

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 79) return '🌧️';
    return '⛈️';
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '48px', background: 'linear-gradient(135deg,#00d4ff,#ff44aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🌤️ Quantum Weather</h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            value={city} 
            onInput={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
            placeholder="Enter city name..."
            style={{ padding: '12px 20px', borderRadius: '30px', width: '250px', background: 'rgba(255,255,255,0.1)', border: '1px solid #00d4ff', color: '#fff' }}
          />
          <button onClick={fetchWeather} className="clj-btn" style={{ padding: '12px 30px', borderRadius: '30px', background: 'linear-gradient(135deg,#00d4ff,#ff44aa)' }} disabled={loading}>
            {loading ? '🌀 Loading...' : '🔍 Search'}
          </button>
          <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} className="clj-btn" style={{ padding: '12px 20px', borderRadius: '30px', background: 'rgba(255,255,255,0.1)' }}>
            {unit === 'metric' ? '°C' : '°F'}
          </button>
        </div>
      </div>

      {weather && (
        <div className="clj-glass" style={{ maxWidth: '500px', margin: '0 auto', padding: '30px', borderRadius: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '80px' }}>{getWeatherIcon(weather.condition)}</div>
          <h2 style={{ fontSize: '48px', margin: '10px 0' }}>{weather.temp}°{unit === 'metric' ? 'C' : 'F'}</h2>
          <p style={{ fontSize: '24px' }}>{city}</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
            <div>💧 Humidity<br/>{weather.humidity}%</div>
            <div>🌬️ Wind<br/>{weather.wind} {unit === 'metric' ? 'km/h' : 'mph'}</div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ textAlign: 'center' }}>5-Day Forecast</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '10px', marginTop: '20px' }}>
            {forecast.map((day, i) => (
              <div key={i} className="clj-card" style={{ padding: '15px', textAlign: 'center', borderRadius: '15px' }}>
                <div style={{ fontSize: '30px' }}>{getWeatherIcon(day.condition)}</div>
                <strong>{day.day}</strong>
                <div>{Math.round(day.high)}° / {Math.round(day.low)}°</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

__CLJ_mount(WeatherDashboard, 'root');