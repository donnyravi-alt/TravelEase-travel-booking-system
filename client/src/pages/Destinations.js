import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { destinationsAPI } from '../services/api';

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      setLoading(true);
      try {
        const data = await destinationsAPI.getAll(queryParam);
        setDestinations(data);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, [queryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="container py-5">
      <div className="row align-items-center mb-4">
        <div className="col-md-6">
          <h2 className="fw-bold mb-1">Explore Travel Destinations</h2>
          <p className="text-muted">Find your dream vacation spot from our handpicked list of world destinations.</p>
        </div>
        <div className="col-md-6">
          <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
            <input
              type="text"
              className="form-control rounded-pill px-4 shadow-sm"
              placeholder="Search by city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">
              Search
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading destinations...</span>
          </div>
        </div>
      ) : destinations.length === 0 ? (
        <div className="alert alert-info rounded-4 text-center py-5 shadow-sm">
          <i className="bi bi-search display-4 d-block mb-3 text-muted"></i>
          <h4>No destinations match your search "{queryParam}"</h4>
          <p className="text-muted">Try searching with a different country or city name.</p>
          <button className="btn btn-outline-primary rounded-pill px-4 mt-2" onClick={() => { setSearchQuery(''); setSearchParams({}); }}>
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {destinations.map((dest) => (
            <div key={dest.id} className="col-lg-4 col-md-6">
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
                  {dest.featured ? (
                    <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow">
                      ⭐ Featured
                    </span>
                  ) : null}
                </div>
                <div className="card-body d-flex flex-column p-4">
                  <div className="d-flex align-items-center mb-1 text-primary small fw-semibold">
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> {dest.country}
                  </div>
                  <h4 className="card-title fw-bold text-dark">{dest.name}</h4>
                  <p className="card-text text-muted small flex-grow-1 line-clamp-3 mb-3">
                    {dest.description}
                  </p>
                  <Link to={`/destinations/${dest.id}`} className="btn btn-primary rounded-pill fw-bold w-100">
                    Explore Packages & Hotels <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
