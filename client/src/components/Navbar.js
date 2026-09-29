import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const closeMenus = () => {
    setDropdownOpen(false);
    setNavCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/" onClick={closeMenus}>
          <i className="bi bi-compass-fill me-2 text-warning fs-3"></i>
          <span>Travel<span className="text-warning">Ease</span></span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={!navCollapsed}
          aria-label="Toggle navigation"
          onClick={() => setNavCollapsed(!navCollapsed)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 fw-medium">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeMenus}><i className="bi bi-house-door me-1"></i> Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/destinations" onClick={closeMenus}><i className="bi bi-geo-alt me-1"></i> Destinations</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/packages" onClick={closeMenus}><i className="bi bi-box-seam me-1"></i> Packages</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/hotels" onClick={closeMenus}><i className="bi bi-building me-1"></i> Hotels</Link>
            </li>
            {user && !isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings" onClick={closeMenus}><i className="bi bi-journal-check me-1"></i> My Bookings</Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link text-warning fw-bold" to="/admin/dashboard" onClick={closeMenus}>
                  <i className="bi bi-speedometer2 me-1"></i> Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="dropdown position-relative">
                <button
                  className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 fw-semibold rounded-pill px-3 shadow-sm"
                  type="button"
                  id="userMenu"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <i className={`bi ${isAdmin ? 'bi-shield-lock-fill text-danger' : 'bi-person-circle text-primary'}`}></i>
                  <span>{user.name}</span>
                  {isAdmin && <span className="badge bg-danger ms-1">Admin</span>}
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end shadow-sm ${dropdownOpen ? 'show' : ''}`}
                  style={{ position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem' }}
                  aria-labelledby="userMenu"
                >
                  <li>
                    <Link className="dropdown-item" to="/profile" onClick={closeMenus}>
                      <i className="bi bi-person me-2"></i> Profile
                    </Link>
                  </li>
                  {!isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/my-bookings" onClick={closeMenus}>
                        <i className="bi bi-ticket-perforated me-2"></i> My Bookings
                      </Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item text-danger fw-semibold" to="/admin/dashboard" onClick={closeMenus}>
                        <i className="bi bi-gear me-2"></i> Management Console
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-3 fw-semibold" onClick={closeMenus}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-warning text-dark rounded-pill px-3 fw-bold" onClick={closeMenus}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
