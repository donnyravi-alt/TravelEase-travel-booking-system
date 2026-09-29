import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user, isAdmin, logout, updateUser } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState(user ? user.name : '');
  const [phone, setPhone] = useState(user ? user.phone || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning rounded-4">
          Please log in to view your profile.
        </div>
        <Link to="/login" className="btn btn-primary rounded-pill px-4">Log In</Link>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setName(user.name);
    setPhone(user.phone || '');
    setError('');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authAPI.updateProfile({ name, phone });
      updateUser(res.user);
      setSuccessMsg('Profile updated successfully!');
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show rounded-4 mb-4" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i> {successMsg}
              <button type="button" className="btn-close" onClick={() => setSuccessMsg('')}></button>
            </div>
          )}

          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-header bg-primary text-white p-4 text-center">
              <div className="avatar-circle mx-auto mb-3 bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold fs-2 shadow" style={{ width: '80px', height: '80px' }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="fw-bold mb-0">{user.name}</h3>
              <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-1 rounded-pill mt-2`}>
                {isAdmin ? 'Admin Account' : 'Standard Member'}
              </span>
            </div>

            <div className="card-body p-4">
              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted"><i className="bi bi-envelope me-2 text-primary"></i> Email Address</span>
                  <strong className="text-dark">{user.email}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted"><i className="bi bi-telephone me-2 text-primary"></i> Phone Number</span>
                  <strong className="text-dark">{user.phone || 'Not provided'}</strong>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                  <span className="text-muted"><i className="bi bi-shield-check me-2 text-primary"></i> Access Role</span>
                  <strong className="text-capitalize text-dark">{user.role}</strong>
                </li>
                {user.created_at && (
                  <li className="list-group-item d-flex justify-content-between align-items-center py-3">
                    <span className="text-muted"><i className="bi bi-calendar-check me-2 text-primary"></i> Member Since</span>
                    <span className="text-muted small">{new Date(user.created_at).toLocaleDateString()}</span>
                  </li>
                )}
              </ul>

              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary rounded-pill py-2 fw-bold" onClick={handleOpenEdit}>
                  <i className="bi bi-pencil-square me-2"></i> Edit Profile Info
                </button>
                {!isAdmin ? (
                  <Link to="/my-bookings" className="btn btn-primary rounded-pill py-2 fw-bold">
                    <i className="bi bi-journal-check me-2"></i> View My Bookings
                  </Link>
                ) : (
                  <Link to="/admin/dashboard" className="btn btn-warning text-dark rounded-pill py-2 fw-bold">
                    <i className="bi bi-speedometer2 me-2"></i> Admin Dashboard
                  </Link>
                )}
                <button onClick={logout} className="btn btn-outline-danger rounded-pill py-2 fw-bold">
                  <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal show d-block bg-dark bg-opacity-50 tab-index-modal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold"><i className="bi bi-pencil-square me-2"></i> Edit Profile</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div className="modal-body p-4">
                  {error && (
                    <div className="alert alert-danger rounded-3 small py-2 mb-3">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-2 text-muted small">
                    <i className="bi bi-info-circle me-1"></i> Email address (<code>{user.email}</code>) cannot be modified.
                  </div>
                </div>
                <div className="modal-footer border-0 p-3 bg-light">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" disabled={loading}>
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
