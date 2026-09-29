import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { destinationsAPI } from '../services/api';
import WeatherWidget from '../components/WeatherWidget';

export default function DestinationDetail() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDestination() {
      try {
        const data = await destinationsAPI.getById(id);
        setDestination(data);
      } catch (err) {
        setError(err.message || 'Failed to load destination details.');
      } finally {
        setLoading(false);
      }
    }
    loadDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading destination...</span>
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger rounded-4 text-center py-4 shadow-sm">
          <h4>Destination Not Found</h4>
          <p>{error || 'The requested destination does not exist.'}</p>
          <Link to="/destinations" className="btn btn-outline-danger rounded-pill mt-2">
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Destination Hero Header */}
      <div
        className="destination-header text-white py-5 position-relative"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${destination.image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '380px'
        }}
      >
        <div className="container py-5">
          <Link to="/destinations" className="btn btn-outline-light btn-sm rounded-pill mb-3">
            <i className="bi bi-arrow-left me-1"></i> All Destinations
          </Link>
          <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold ms-2 align-middle">
            <i className="bi bi-geo-alt-fill me-1"></i> {destination.country}
          </span>
          <h1 className="display-4 fw-extrabold mb-2 text-white">{destination.name}</h1>
          <p className="lead max-w-700 text-white-90">{destination.description}</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-8">
            {/* Packages Section */}
            <div className="mb-5">
              <h3 className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-box-seam text-primary me-2"></i> Travel Packages in {destination.name}
              </h3>
              {destination.packages && destination.packages.length > 0 ? (
                <div className="row g-4">
                  {destination.packages.map((pkg) => (
                    <div key={pkg.id} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                        <img
                          src={pkg.image_url || destination.image_url}
                          className="card-img-top package-img"
                          alt={pkg.title}
                        />
                        <div className="card-body p-4 d-flex flex-column">
                          <span className="badge bg-info text-dark mb-2 align-self-start">
                            <i className="bi bi-clock me-1"></i> {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                          </span>
                          <h5 className="fw-bold text-dark mb-2">{pkg.title}</h5>
                          <p className="text-muted small flex-grow-1 mb-3">{pkg.description}</p>
                          <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fs-7 text-muted">Per traveler</span>
                              <h4 className="fw-bold text-success mb-0">${pkg.price_per_person}</h4>
                            </div>
                            <Link
                              to={`/book?package_id=${pkg.id}&destination_id=${destination.id}`}
                              className="btn btn-primary rounded-pill px-4 fw-bold"
                            >
                              Book Package
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning rounded-4">No specific packages listed for this destination yet.</div>
              )}
            </div>

            {/* Hotels Section */}
            <div>
              <h3 className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-building text-primary me-2"></i> Available Hotels & Resorts
              </h3>
              {destination.hotels && destination.hotels.length > 0 ? (
                <div className="row g-4">
                  {destination.hotels.map((hotel) => (
                    <div key={hotel.id} className="col-md-6">
                      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                        <img
                          src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                          className="card-img-top hotel-img"
                          alt={hotel.name}
                        />
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="fw-bold text-dark mb-0">{hotel.name}</h5>
                            <span className="badge bg-warning text-dark">
                              ★ {hotel.rating}
                            </span>
                          </div>
                          <p className="text-muted small mb-3">
                            <i className="bi bi-stars me-1 text-primary"></i> {hotel.amenities}
                          </p>
                          <div className="d-flex justify-content-between align-items-center border-top pt-3">
                            <div>
                              <span className="fs-7 text-muted">Per night</span>
                              <h5 className="fw-bold text-primary mb-0">${hotel.price_per_night}</h5>
                            </div>
                            <span className="badge bg-light text-dark border">
                              Includes Rooms
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-warning rounded-4">No hotel partners registered for this location yet.</div>
              )}
            </div>
          </div>

          {/* Sidebar: OpenWeatherMap Weather & Quick Booking */}
          <div className="col-lg-4">
            <div className="sticky-top pt-2" style={{ zIndex: 10 }}>
              {/* Weather Widget */}
              <WeatherWidget weather={destination.weather} locationName={destination.name} />

              {/* Quick Info Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-light">
                <h5 className="fw-bold mb-3"><i className="bi bi-info-circle text-primary me-2"></i>Destination Info</h5>
                <ul className="list-unstyled text-muted small mb-4">
                  <li className="mb-2"><strong className="text-dark">Country:</strong> {destination.country}</li>
                  <li className="mb-2"><strong className="text-dark">Base Price Starts:</strong> ${destination.price_starting}</li>
                  <li className="mb-2"><strong className="text-dark">Best Time to Visit:</strong> All Year Round</li>
                  <li className="mb-2"><strong className="text-dark">Language:</strong> Local / English</li>
                </ul>
                {destination.packages && destination.packages.length > 0 ? (
                  <Link
                    to={`/book?destination_id=${destination.id}&package_id=${destination.packages[0].id}`}
                    className="btn btn-warning text-dark fw-bold rounded-pill w-100 py-2 shadow-sm"
                  >
                    Start Booking Trip
                  </Link>
                ) : (
                  <Link to="/packages" className="btn btn-primary fw-bold rounded-pill w-100">
                    Browse All Packages
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
