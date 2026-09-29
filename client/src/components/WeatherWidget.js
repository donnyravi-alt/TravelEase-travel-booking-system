import React from 'react';

export default function WeatherWidget({ weather, locationName }) {
  if (!weather) return null;

  const getWeatherBadgeClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return 'bg-warning text-dark';
      case 'rain':
      case 'drizzle':
        return 'bg-info text-dark';
      case 'clouds':
      case 'partly cloudy':
        return 'bg-secondary text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="card weather-card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-gradient-weather text-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-uppercase tracking-wider fs-7 text-white-50 fw-bold">Live Weather Forecast</span>
          <h4 className="fw-bold mb-0 text-white">{locationName}</h4>
        </div>
        <span className={`badge ${getWeatherBadgeClass(weather.condition)} px-3 py-2 rounded-pill fs-7`}>
          {weather.condition}
        </span>
      </div>
      <div className="row align-items-center">
        <div className="col-6 col-md-5">
          <div className="d-flex align-items-center">
            <h1 className="display-4 fw-bold me-2 mb-0 text-white">{weather.temp}°C</h1>
            <i className={`bi ${weather.condition === 'Sunny' ? 'bi-sun-fill text-warning' : 'bi-cloud-sun-fill text-light'} display-6`}></i>
          </div>
          <p className="text-white-70 small mb-0 capitalize">{weather.description}</p>
        </div>
        <div className="col-6 col-md-7 border-start border-white border-opacity-25 ps-4">
          <div className="row g-2 small">
            <div className="col-6">
              <div className="text-white-50">Humidity</div>
              <div className="fw-bold fs-6"><i className="bi bi-droplet me-1"></i>{weather.humidity}%</div>
            </div>
            <div className="col-6">
              <div className="text-white-50">Wind Speed</div>
              <div className="fw-bold fs-6"><i className="bi bi-wind me-1"></i>{weather.wind_speed} km/h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
