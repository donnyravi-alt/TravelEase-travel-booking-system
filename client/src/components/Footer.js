import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="text-warning fw-bold d-flex align-items-center mb-3">
              <i className="bi bi-compass-fill me-2"></i> TravelEase
            </h5>
            <p className="text-muted small">
              Your trusted partner for memorable travel packages, luxury hotel stays, and hassle-free global destination bookings.
            </p>
            <div className="d-flex gap-3 fs-5">
              <a href="#twitter" className="text-light text-opacity-75 hover-warning"><i className="bi bi-twitter-x"></i></a>
              <a href="#facebook" className="text-light text-opacity-75 hover-warning"><i className="bi bi-facebook"></i></a>
              <a href="#instagram" className="text-light text-opacity-75 hover-warning"><i className="bi bi-instagram"></i></a>
              <a href="#youtube" className="text-light text-opacity-75 hover-warning"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-muted text-decoration-none">Home</Link></li>
              <li className="mb-2"><Link to="/destinations" className="text-muted text-decoration-none">Destinations</Link></li>
              <li className="mb-2"><Link to="/packages" className="text-muted text-decoration-none">Packages</Link></li>
              <li className="mb-2"><Link to="/hotels" className="text-muted text-decoration-none">Hotels</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Popular Locations</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/destinations/1" className="text-muted text-decoration-none">Paris, France</Link></li>
              <li className="mb-2"><Link to="/destinations/2" className="text-muted text-decoration-none">Bali, Indonesia</Link></li>
              <li className="mb-2"><Link to="/destinations/3" className="text-muted text-decoration-none">Tokyo, Japan</Link></li>
              <li className="mb-2"><Link to="/destinations/5" className="text-muted text-decoration-none">Maldives</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Contact Support</h6>
            <p className="text-muted small mb-1"><i className="bi bi-geo-alt me-2"></i> 100 Travel Street, Suite 400</p>
            <p className="text-muted small mb-1"><i className="bi bi-envelope me-2"></i> support@travelease.com</p>
            <p className="text-muted small mb-3"><i className="bi bi-telephone me-2"></i> +1 (800) 555-TRAVEL</p>
            <span className="badge bg-secondary">24/7 Global Concierge</span>
          </div>
        </div>
        <hr className="my-4 border-secondary opacity-25" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted">
          <div>&copy; {new Date().getFullYear()} TravelEase Inc. All rights reserved.</div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span className="cursor-pointer">Privacy Policy</span>
            <span className="cursor-pointer">Terms of Service</span>
            <span className="cursor-pointer">Student Project Demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
