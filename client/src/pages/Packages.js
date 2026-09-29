import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { packagesAPI, destinationsAPI } from '../services/api';

export default function Packages() {
  const [packages, setPackages] = useState([]);
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
    async function loadPackages() {
      setLoading(true);
      setError('');
      try {
        const data = await packagesAPI.getAll(selectedDestination);
        setPackages(data);
      } catch (err) {
        setError(err.message || 'Failed to load packages.');
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
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
          <h2 className="fw-bold mb-2">Curated Travel Packages</h2>
          <p className="text-muted mb-0">Choose from our all-inclusive tour packages with flights, hotels, and sightseeing planned to perfection.</p>
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
            <span className="visually-hidden">Loading packages...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 text-center py-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
        </div>
      ) : packages.length === 0 ? (
        <div className="alert alert-info text-center py-5 rounded-4 shadow-sm">
          <i className="bi bi-box-seam display-4 d-block mb-3 text-muted"></i>
          <h4>No travel packages found {selectedDestination ? 'for the selected destination' : 'at the moment'}.</h4>
          {selectedDestination && (
            <button className="btn btn-outline-primary rounded-pill px-4 mt-2" onClick={() => { setSelectedDestination(''); setSearchParams({}); }}>
              Show All Packages
            </button>
          )}
        </div>
      ) : (
        <div className="row g-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden package-card">
                <div className="position-relative">
                  <img
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80'}
                    className="card-img-top package-img"
                    alt={pkg.title}
                  />
                  <span className="badge bg-primary position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow">
                    <i className="bi bi-clock me-1"></i> {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="text-primary fw-bold small mb-1">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> {pkg.destination_name}, {pkg.country}
                  </div>
                  <h4 className="fw-bold mb-2 text-dark">{pkg.title}</h4>
                  <p className="text-muted small flex-grow-1 mb-3 line-clamp-3">{pkg.description}</p>
                  
                  <div className="mb-3 bg-light p-2 rounded-3 small">
                    <strong className="text-dark">Inclusions:</strong> {pkg.inclusions || 'Hotel, Breakfast, Sightseeing'}
                  </div>

                  <div className="border-top pt-3 d-flex justify-content-between align-items-center mt-auto">
                    <div>
                      <span className="text-muted fs-7">Per person</span>
                      <h4 className="fw-bold text-success mb-0">${pkg.price_per_person}</h4>
                    </div>
                    <Link
                      to={`/book?package_id=${pkg.id}&destination_id=${pkg.destination_id}`}
                      className="btn btn-warning text-dark fw-bold rounded-pill px-4"
                    >
                      Book Package
                    </Link>
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
