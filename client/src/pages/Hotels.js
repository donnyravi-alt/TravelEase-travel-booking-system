import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hotelsAPI, destinationsAPI } from '../services/api';

export default function Hotels() {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const destFilterParam = searchParams.get('destination_id') || '';
  const [selectedDestination, setSelectedDestination] = useState(destFilterParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDestinationsList() {
      try {
        const dests = await destinationsAPI.getAll();
        setDestinations(dests);
      } catch (err) {
        console.warn('Could not load destinations list for filter:', err.message);
      }
    }
    loadDestinationsList();
  }, []);

  useEffect(() => {
    setSelectedDestination(destFilterParam);
  }, [destFilterParam]);

  useEffect(() => {
    async function loadHotels() {
      setLoading(true);
      setError('');
      try {
        const data = await hotelsAPI.getAll(selectedDestination);
        setHotels(data);
      } catch (err) {
        setError(err.message || 'Failed to load hotels.');
      } finally {
        setLoading(false);
      }
    }
    loadHotels();
  }, [selectedDestination]);

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    setSelectedDestination(val);
    if (val) {
      setSearchParams({ destination_id: val });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container py-5">
      <div className="row align-items-center mb-5">
        <div className="col-lg-8">
          <h2 className="fw-bold mb-2">Luxury Hotels & Partner Resorts</h2>
          <p className="text-muted mb-0">Top rated accommodations around the globe paired with your package bookings.</p>
        </div>
        <div className="col-lg-4 mt-3 mt-lg-0">
          <div className="d-flex align-items-center gap-2 justify-content-lg-end">
            <label className="fw-bold small text-muted text-nowrap"><i className="bi bi-funnel-fill me-1 text-primary"></i> Filter by Destination:</label>
            <select
              className="form-select rounded-pill shadow-sm"
              value={selectedDestination}
              onChange={handleDestinationChange}
            >
              <option value="">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading hotels...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 text-center py-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      ) : hotels.length === 0 ? (
        <div className="alert alert-info text-center py-5 rounded-4 shadow-sm">
          <i className="bi bi-building display-4 d-block mb-3 text-muted"></i>
          <h4>No hotels found {selectedDestination ? 'for the selected destination' : 'at the moment'}.</h4>
          {selectedDestination && (
            <button className="btn btn-outline-primary rounded-pill px-4 mt-2" onClick={() => { setSelectedDestination(''); setSearchParams({}); }}>
              Show All Hotels
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="position-relative">
                  <img
                    src={hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                    className="card-img-top hotel-img"
                    alt={hotel.name}
                  />
                  <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow fw-bold">
                    ★ {hotel.rating} Rating
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="text-primary fw-bold small mb-1">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> {hotel.destination_name}
                  </div>
                  <h4 className="fw-bold mb-2 text-dark">{hotel.name}</h4>
                  <p className="text-muted small flex-grow-1 mb-3">
                    <i className="bi bi-stars me-1 text-primary"></i> <strong>Amenities:</strong> {hotel.amenities}
                  </p>
                  
                  <div className="border-top pt-3 d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <span className="text-muted fs-7">Nightly rate</span>
                      <h4 className="fw-bold text-primary mb-0">${hotel.price_per_night}</h4>
                    </div>
                    <span className="badge bg-light text-dark border px-3 py-2">
                      Available in Booking Form
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
