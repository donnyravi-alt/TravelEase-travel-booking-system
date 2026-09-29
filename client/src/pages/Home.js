import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destinationsAPI, packagesAPI } from '../services/api';

export default function Home() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const destData = await destinationsAPI.getAll();
        const pkgData = await packagesAPI.getAll();
        setDestinations(destData.slice(0, 4));
        setPackages(pkgData.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/destinations');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-white py-5 position-relative overflow-hidden">
        <div className="container py-5 my-3 position-relative z-1">
          <div className="row justify-content-center text-center">
            <div className="col-lg-10">
              <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3 shadow-sm">
                ✈️ #1 Travel Booking Platform
              </span>
              <h1 className="display-3 fw-extrabold mb-3 text-shadow">
                Discover The World's Most Extraordinary Places
              </h1>
              <p className="lead mb-4 text-white-90 max-w-700 mx-auto">
                Explore curated travel packages, luxury hotels, and breathtaking destinations with instant booking confirmation.
              </p>
              
              {/* Search Bar */}
              <div className="card shadow-lg border-0 rounded-4 p-2 bg-white text-dark max-w-800 mx-auto">
                <form onSubmit={handleSearch} className="row g-2 align-items-center">
                  <div className="col-md-8 col-sm-12">
                    <div className="input-group input-group-lg border-0">
                      <span className="input-group-text bg-transparent border-0 text-primary">
                        <i className="bi bi-search fs-4"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 shadow-none fs-6"
                        placeholder="Search destination, country or city (e.g., Paris, Bali, Tokyo)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-12">
                    <button type="submit" className="btn btn-primary btn-lg w-100 rounded-3 fw-bold">
                      Explore Destinations
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <h6 className="text-primary text-uppercase fw-bold tracking-wider mb-1">Top Picked Locations</h6>
              <h2 className="fw-bold mb-0">Featured Destinations</h2>
            </div>
            <Link to="/destinations" className="btn btn-outline-primary fw-bold rounded-pill">
              View All Destinations <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading destinations...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {destinations.map((dest) => (
                <div key={dest.id} className="col-lg-3 col-md-6">
                  <div className="card destination-card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="position-relative">
                      <img
                        src={dest.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'}
                        className="card-img-top destination-img"
                        alt={dest.name}
                      />
                      <span className="position-absolute top-0 end-0 bg-dark text-white bg-opacity-75 px-3 py-1 m-3 rounded-pill fs-7 fw-bold">
                        From ${dest.price_starting}
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column p-4">
                      <div className="d-flex align-items-center mb-1 text-muted small">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i> {dest.country}
                      </div>
                      <h5 className="card-title fw-bold text-dark">{dest.name}</h5>
                      <p className="card-text text-muted small flex-grow-1 line-clamp-2">
                        {dest.description}
                      </p>
                      <Link to={`/destinations/${dest.id}`} className="btn btn-primary rounded-pill fw-bold w-100 mt-2">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Packages */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-primary text-uppercase fw-bold tracking-wider mb-1">Handcrafted Journeys</h6>
            <h2 className="fw-bold mb-2">Popular Travel Packages</h2>
            <p className="text-muted">All-inclusive flight, hotel, and guided tour itineraries for stress-free vacations.</p>
          </div>

          <div className="row g-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="col-lg-4 col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden package-card">
                  <div className="position-relative">
                    <img
                      src={pkg.image_url || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80'}
                      className="card-img-top package-img"
                      alt={pkg.title}
                    />
                    <span className="badge bg-primary position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow">
                      <i className="bi bi-clock me-1"></i> {pkg.duration_days} Days
                    </span>
                  </div>
                  <div className="card-body p-4">
                    <div className="text-primary fw-bold small mb-1">{pkg.destination_name}, {pkg.country}</div>
                    <h5 className="fw-bold mb-2 text-dark">{pkg.title}</h5>
                    <p className="text-muted small line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="border-top pt-3 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted fs-7">Price per traveler</span>
                        <h4 className="fw-bold text-success mb-0">${pkg.price_per_person}</h4>
                      </div>
                      <Link to={`/book?package_id=${pkg.id}&destination_id=${pkg.destination_id}`} className="btn btn-warning text-dark fw-bold rounded-pill px-4">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-3">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <i className="bi bi-shield-check display-5 text-warning mb-2"></i>
              <h5 className="fw-bold mb-1">Guaranteed Booking</h5>
              <p className="small text-white-70 mb-0">Instant database receipt & code</p>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-headset display-5 text-warning mb-2"></i>
              <h5 className="fw-bold mb-1">24/7 Concierge</h5>
              <p className="small text-white-70 mb-0">Always here to support your trip</p>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-cloud-sun display-5 text-warning mb-2"></i>
              <h5 className="fw-bold mb-1">Live Weather Info</h5>
              <p className="small text-white-70 mb-0">OpenWeatherMap API updates</p>
            </div>
            <div className="col-md-3 col-6">
              <i className="bi bi-credit-card-2-front display-5 text-warning mb-2"></i>
              <h5 className="fw-bold mb-1">Flexible Price Calc</h5>
              <p className="small text-white-70 mb-0">Transparent fee breakdowns</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
